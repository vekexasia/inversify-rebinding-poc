import {Container, interfaces} from 'inversify';
import 'reflect-metadata'
import Context = interfaces.Context;
import Metadata = interfaces.Metadata;

type Constructor = new (...args: any[]) => any

export type SingleMeta = { from: number, symbol: symbol }

/**
 * This class lets you rewire injected properties on the fly
 * based on a numeric
 */
export class AutoRebind {
  private collections: { [symbol: string]: Array<{ from: number, clz: Constructor }> } = {};
  /*
   * Keeps the steps counter for each symbol
   */
  private stepsBySymbol: { [symbol: string]: number };

  // Keeps a list of instances having an injected property of such symbol
  private instancesBySymbol: { [symbol: string]: Array<{ prop: string, instance: any }> } = {};


  constructor(private id: string) {
  }

  /**
   * Reads metas from a class decorated usin #this.decorator()
   * @param {Constructor} constructor
   * @return {Array<SingleMeta>}
   */
  public getMetas(constructor: Constructor): Array<SingleMeta> {
    return Reflect.getMetadata(`rebind:${this.id}`, constructor) || [];
  }

  /**
   * Internal use only Exposed only for
   * @param {Constructor} constructor
   * @param {Array<SingleMeta>} metas
   */
  public putMetas(constructor: Constructor, metas: Array<SingleMeta>) {
    Reflect.defineMetadata(`rebind:${this.id}`, metas, constructor);
  }

  /**
   * Decorator method to use on the injected classes.
   * @param {number} from the number where the class will be active from
   * @param {symbol} what the symbol used when using @inject()
   * @return {ClassDecorator}
   */
  public decorator(from: number, what: symbol): ClassDecorator {
    return (constructor: any) => {
      if (!Array.isArray(this.collections[what as any])) {
        this.collections[what as any] = [];
      }

      // If the same from is already in place then throw.
      if (this.collections[what as any].find((item) => item.from === from)) {
        throw new Error(`Coinciding multiple equal froms ${from}`);
      }

      this.collections[what as any].push({ from, clz: constructor });
      this.collections[what as any].sort((a, b) => a.from - b.from);

      const metas = this.getMetas(constructor);
      metas.push({ from, symbol: what });
      this.putMetas(constructor, metas);

      return constructor;
    }
  }

  /**
   * Removes an instance from the tracked collections
   * Use this when the instance needs to be disposed.
   * @returns the number of removed entries.
   */
  public removeInstance(instance: any): number {
    const symbols = Object.getOwnPropertySymbols(this.instancesBySymbol);
    let removed   = 0;
    for (const symbol of symbols) {
      let idx = 0;
      do {
        idx = this.instancesBySymbol[symbol].findIndex((a) => a.instance === instance);
        if (idx !== -1) {
          this.instancesBySymbol[symbol].splice(idx, 1);
          removed++;
        }
      } while (idx !== -1);
    }
    return removed;
  }


  /**
   * Update the changer value to a new value. This also takes care of
   *  - check if a new class is now going to be used
   *  - remove the old class instance
   *  - inject the new instance to the correct ones.
   *
   */
  public updateChanger(newVal: number, c: Container) {
    this.init();
    let somethingChanged = false;
    const keys           = Object.getOwnPropertySymbols(this.stepsBySymbol);
    for (let k of  keys) {
      const curStep   = this.stepsBySymbol[k];
      let desiredStep = this.collections[k].findIndex((a) => a.from > newVal) - 1;
      if (desiredStep < 0) {
        desiredStep = this.collections[k].length - 1;
      }
      if (curStep != desiredStep) {
        // console.log(`${k.toString()} from step ${curStep} to step ${desiredStep}`);
        this.stepsBySymbol[k] = desiredStep;
        somethingChanged = true;
        // Call rebind to change the current associated instance for such symbol and
        // keep track of the instance with myOnActivation()

        c.rebind<any>(k).to(this.collections[k][desiredStep].clz).inSingletonScope()
          .onActivation(this.onActivation());
        // Update instances of this symbol.
        if (Array.isArray(this.instancesBySymbol[k])) {
          this.instancesBySymbol[k]
            .forEach(({ instance, prop }) => {
              // Use container.get to get such instance.
              const old      = instance[prop];
              instance[prop] = c.get(k); // update instance.
              this.removeInstance(old);
              // console.log(`Updated ${instance.constructor.name}.${prop} from ${old.constructor.name} to ${instance[prop].constructor.name}`);
            })
        }
      }
    }
    return somethingChanged;
  }

  /**
   * Add this to every member that has an injected property which
   * is mutable by this "changer"
   */
  public onActivation<T>() {
    return (context: Context, injectable: T): T => {
      const props: { [k: string]: Metadata[] } = Reflect.getMetadata('inversify:tagged_props', injectable.constructor);
      if (typeof(props) === 'undefined') {
        // no injected dependencies. nothing to do.
        return injectable;
      }
      const properties = Object.keys(props);
      for (const property of properties) {
        // Filter property that needs to be injected and that whose value (symbol)
        // is included in our handled collections!
        const mutableByThisId: Metadata[] = props[property]
          .filter((item) => item.key === 'inject')
          .filter((item) => typeof(this.collections[item.value]) !== 'undefined');

        // Can a property have multi @inject ?
        if (mutableByThisId.length === 1) {
          // Add to the instancesCollections.
          const [meta] = mutableByThisId;
          const arr    = this.instancesBySymbol[meta.value] || [];
          arr.push({ prop: property, instance: injectable });
          this.instancesBySymbol[meta.value] = arr;
        } else if (mutableByThisId.length > 1) {
          throw new Error(`WTF? ${JSON.stringify(mutableByThisId, null, 2)}`);
        }
      }

      return injectable;
    }
  }


  /**
   * This is only used to initialize the stepsBySymbol Map
   * @return {this}
   */
  private init(): this {
    if (typeof(this.stepsBySymbol) === 'undefined') {
      this.stepsBySymbol = {};
      Object.getOwnPropertySymbols(this.collections)
        .forEach((k) => this.stepsBySymbol[k] = 0);
    }
    return this;
  }
}