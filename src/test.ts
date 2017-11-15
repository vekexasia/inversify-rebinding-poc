import {Container, inject, injectable} from "inversify";
import "reflect-metadata";
import {expect} from 'chai';
import {Symbols} from './symbols';
import {CyberHacker, GunMan, IWarrior, Ninja} from './warriors';
import {BasicArmor, FirewallArmor, KevlarArmor} from './armors';
import {yearsRebinder} from './rebinders';

// Creates temporary object with references

@injectable()
class Army {
  @inject(Symbols.warrior)
  public warrior: IWarrior;

  @inject(Symbols.year)
  private __year: () => number;

  public get year() {
    return this.__year();
  }
}


let year = 0;
const c  = new Container();
c.bind(Symbols.warrior).to(Ninja);
c.bind(Symbols.armor).to(BasicArmor);
c.bind(Army).toSelf().onActivation(yearsRebinder.onActivation<Army>());
c.bind(Symbols.year).toConstantValue(() => year);


const army  = c.get<Army>(Army);
const army2 = c.get<Army>(Army);

/**
 * Tests army, army2 and a newly retrieved Army instance from the container.
 */
function checkInstances(warrior: any, armor: any) {
  [army, army2, c.get<Army>(Army)].forEach((army) => {
    expect(army.warrior).to.be.an.instanceof(warrior);
    expect(army.warrior.armor).to.be.an.instanceof(armor);
  });
}



checkInstances(Ninja, BasicArmor);

year = 1991;
yearsRebinder.updateChanger(year, c);
checkInstances(GunMan, BasicArmor);

// Now gunman becomes an hacker with kevlar
year = 2000;
yearsRebinder.updateChanger(year, c);
checkInstances(CyberHacker, KevlarArmor);

// hacker now has a firewall!
year = 2001;
yearsRebinder.updateChanger(year, c);
checkInstances(CyberHacker, FirewallArmor);

// After apocalypse only ninjas with kevlars!
year = 2100;
yearsRebinder.updateChanger(year, c);
checkInstances(Ninja, KevlarArmor);
