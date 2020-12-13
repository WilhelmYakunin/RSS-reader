import Model from './model';

export default class Controller {
  constructor(inputData) {
    this.inputData = inputData;
  }

  transmitData() {
    const model = new Model(this.inputData);
    model.isValidLink();
  }
}
