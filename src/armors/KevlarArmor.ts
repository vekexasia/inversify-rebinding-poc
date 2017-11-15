import {Symbols} from '../symbols';
import {yearFrom} from '../autoRebind';
import {injectable} from 'inversify';
import {IArmor} from './IArmor';

@injectable()
@yearFrom(2000, Symbols.armor)
@yearFrom(2100, Symbols.armor) // After the apocalypse kevlar armors. are the only ones left for humanity
export class KevlarArmor implements IArmor {
  protectionLevel = 10;
}