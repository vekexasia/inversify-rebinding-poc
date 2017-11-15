import {Symbols} from '../symbols';
import {injectable} from 'inversify';
import {IArmor} from './IArmor';
import {yearsRebinder} from '../rebinders';

@injectable()
@yearsRebinder.decorator(0, Symbols.armor)
export class BasicArmor implements IArmor {
  protectionLevel = 10;
}