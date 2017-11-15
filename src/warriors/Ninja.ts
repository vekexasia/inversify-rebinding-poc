import {Symbols} from '../symbols';

import {inject, injectable} from 'inversify';
import {IWarrior} from './IWarrior';
import {IArmor} from '../armors';
import {yearsRebinder} from '../rebinders';

@injectable()
@yearsRebinder.decorator(0, Symbols.warrior)
@yearsRebinder.decorator(2100, Symbols.warrior)
export class Ninja implements IWarrior {
  @inject(Symbols.armor)
  public armor: IArmor;

  attack() {
    return 'yatah!';
  }
}