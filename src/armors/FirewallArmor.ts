import {Symbols} from '../symbols';
import {injectable} from 'inversify';
import {IArmor} from './IArmor';
import {yearsRebinder} from '../rebinders';

@injectable()
@yearsRebinder.decorator(2001, Symbols.armor)
export class FirewallArmor implements IArmor {
  protectionLevel = 1000;
}