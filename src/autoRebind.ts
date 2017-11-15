import {Container, interfaces} from 'inversify';
import 'reflect-metadata'
import Context = interfaces.Context;
import Metadata = interfaces.Metadata;

type Constructor = new (...args: any[]) => any

const collections: { [k: string]: Array<{ from: number, clz: Constructor }> } = {};

// yearFrom Decorator
export function yearFrom(from: number, what: Symbol): ClassDecorator {
  return (constructor: any) => {
    if (!Array.isArray(collections[what as any])) {
      collections[what as any] = [];
    }

    // If the same from is already in place then throw.
    if (collections[what as any].find((item) => item.from === from)) {
      throw new Error(`Coinciding multiple equal froms ${from}`);
    }

    collections[what as any].push({ from, clz: constructor });
    collections[what as any].sort((a, b) => a.from - b.from);
    return constructor;
  }
}


const stepsBySymbol: { [k: string]: number } = {};

export function buildSteps() {
  Object.getOwnPropertySymbols(collections)
    .forEach((k) => stepsBySymbol[k] = 0);
}

export function onYearsUpdated(newVal: number, c: Container) {
  let somethingChanged = false;
  const keys           = Object.getOwnPropertySymbols(stepsBySymbol);
  for (let k of  keys) {
    const curStep = stepsBySymbol[k];
    if (curStep < collections[k].length - 1 && collections[k][curStep + 1].from <= newVal) {
      stepsBySymbol[k]++;
      somethingChanged = true;
      // Call rebind to change the current associated instance for such symbol and
      // keep track of the instance with myOnActivation()
      c.rebind<any>(k).to(collections[k][curStep + 1].clz).inSingletonScope()
        .onActivation(myOnActivation());
      // Update instances of this symbol.
      if (Array.isArray(instancesBySymbol[k])) {
        instancesBySymbol[k]
          .forEach(({ instance, prop }) => {
            // Use container.get to get such instance.
            instance[prop] = c.get(k); // update instance.
            console.log(`Updated ${k.toString()} of ${instance.constructor.name} with ${instance[prop].constructor.name}`);
          })
      }
    }
  }
  return somethingChanged;

}

const instancesBySymbol: { [symbol: string]: Array<{ prop: string, instance: any }> } = {};


export function myOnActivation<T>() {
  return (context: Context, injectable: T): T => {
    const props: { [k: string]: Metadata[] } = Reflect.getMetadata('inversify:tagged_props', injectable.constructor);
    if (typeof(props) === 'undefined') {
      // no injected dependencies. nothing to do.
      return injectable;
    }
    const properties = Object.keys(props);
    for (const property of properties) {
      const mutableByYearsMetadatas: Metadata[] = props[property]
        .filter((item) => item.key === 'inject')
        .filter((item) => typeof(collections[item.value]) !== 'undefined');

      // Can a property have multi @inject ?
      if (mutableByYearsMetadatas.length === 1) {
        // Add to the instancesCollections.
        const [meta] = mutableByYearsMetadatas;
        const arr    = instancesBySymbol[meta.value] || [];
        arr.push({ prop: property, instance: injectable });
        instancesBySymbol[meta.value] = arr;
      }
    }

    return injectable;
  }
}
