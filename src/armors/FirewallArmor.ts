import {Symbols} from '../symbols';
import {yearFrom} from '../autoRebind';
import {injectable} from 'inversify';
import {IArmor} from './IArmor';

@injectable()
@yearFrom(2001, Symbols.armor)
export class FirewallArmor implements IArmor {
  protectionLevel = 1000;
}