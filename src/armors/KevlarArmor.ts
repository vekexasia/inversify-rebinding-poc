import {Symbols} from '../symbols';
import {injectable} from 'inversify';
import {IArmor} from './IArmor';
import {yearsRebinder} from '../rebinders';

@injectable()
@yearsRebinder.decorator(2000, Symbols.armor)
@yearsRebinder.decorator(2100, Symbols.armor) // After the apocalypse kevlar armors. are the only ones left for humanity
export class KevlarArmor implements IArmor {
  protectionLevel = 10;
}