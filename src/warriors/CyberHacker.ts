import {Symbols} from '../symbols';
import {inject, injectable} from 'inversify';
import {IWarrior} from './IWarrior';
import {IArmor} from '../armors';
import {yearsRebinder} from '../rebinders';

@injectable()
@yearsRebinder.decorator(2000, Symbols.warrior)
export class CyberHacker implements IWarrior {
  @inject(Symbols.armor)
  public armor: IArmor;

  @inject(Symbols.year)
  public year: () => number;

  attack(): string {
    return '010101101 ' + this.year();
  }
}