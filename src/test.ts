import {Container, inject, injectable, interfaces} from "inversify";
import "reflect-metadata";
import {expect} from 'chai';
import {buildSteps, myOnActivation, onYearsUpdated, yearFrom} from './autoRebind';
import {Symbols} from './symbols';


// Interfaces
interface Armor {
  protectionLevel: number
}


interface Warrior {
  armor: Armor;

  attack(): string;
}


// Armors
@injectable()
@yearFrom(0, Symbols.armor)
class BasicArmor implements Armor {
  protectionLevel = 10;
}

@injectable()
@yearFrom(2000, Symbols.armor)
@yearFrom(2100, Symbols.armor)
class KevlarArmor implements Armor {
  protectionLevel = 100;
}

@injectable()
@yearFrom(2001, Symbols.armor)
class FirewallArmor implements Armor {
  protectionLevel = 1000;
}


// Warriors
@injectable()
@yearFrom(0, Symbols.warrior)
@yearFrom(2100, Symbols.warrior)
class Ninja implements Warrior {
  @inject(Symbols.armor)
  public armor: Armor;

  attack() {
    return 'yatah!';
  }
}

@injectable()
@yearFrom(1990, Symbols.warrior)
class GunMan implements Warrior {
  @inject(Symbols.armor)
  public armor: Armor;

  attack(): string {
    return 'bang!';
  }
}

@injectable()
@yearFrom(2000, Symbols.warrior)
class CyberHacker implements Warrior {
  @inject(Symbols.armor)
  public armor: Armor;

  @inject(Symbols.year)
  public year: () => number;

  attack(): string {
    return '010101101 ' + this.year();
  }
}

@injectable()
class Army {
  @inject(Symbols.warrior)
  public warrior: Warrior;

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
//c.bind('Warrior').toConstantValue(new Proxy({}, {}));
c.bind(Army).toSelf().onActivation(myOnActivation<Army>())
c.bind(Symbols.year).toConstantValue(() => year);


buildSteps();

const army  = c.get(Army);
const army2 = c.get(Army);

function expectData(warrior: any, armor: any) {
  [army, army2, c.get<Army>(Army)].forEach((army) => {
    expect(army.warrior).to.be.an.instanceof(warrior);
    expect(army.warrior.armor).to.be.an.instanceof(armor);
  });
}




expectData(Ninja, BasicArmor);

year = 1991;
onYearsUpdated(year, c);
expectData(GunMan, BasicArmor);

// Now gunman becomes an hacker with kevlar
year = 2000;
onYearsUpdated(year, c);
expectData(CyberHacker, KevlarArmor);

// hacker now has a firewall!
year = 2001;
onYearsUpdated(year, c);
expectData(CyberHacker, FirewallArmor);

// After apocalypse only ninjas with kevlars!
year = 2100;
onYearsUpdated(year, c);
expectData(Ninja, KevlarArmor);
