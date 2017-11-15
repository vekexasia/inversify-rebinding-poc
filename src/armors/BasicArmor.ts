import {Symbols} from '../symbols';
import {yearFrom} from '../autoRebind';
import {injectable} from 'inversify';
import {IArmor} from './IArmor';

@injectable()
@yearFrom(0, Symbols.armor)
export class BasicArmor implements IArmor {
  protectionLevel = 10;
}