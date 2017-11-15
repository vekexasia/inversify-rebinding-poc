import {Symbols} from '../symbols';
import {yearFrom} from '../autoRebind';
import {inject, injectable} from 'inversify';
import {IWarrior} from './IWarrior';
import {IArmor} from '../armors';

@injectable()
@yearFrom(2000, Symbols.warrior)
export class CyberHacker implements IWarrior {
  @inject(Symbols.armor)
  public armor: IArmor;

  @inject(Symbols.year)
  public year: () => number;

  attack(): string {
    return '010101101 ' + this.year();
  }
}