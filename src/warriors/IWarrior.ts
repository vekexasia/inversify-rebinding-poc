import {IArmor} from '../armors';

export interface IWarrior {
  armor: IArmor;

  attack(): string;
}