import Digits from './components/Digits.js';
import Total from './components/Total.js';
import Operations from './components/Operations.js';
import Modifiers from './components/Modifiers.js';
import { $ } from './utils/dom.js';
import { validator, executor, extractor } from './utils/index.js';
import { DOM, OPERATION, MODIFIER, INIT_STATE, MESSAGE } from './constants.js';

class App {
  constructor(target) {
    this.$target = $(target);
    this.state = { ...INIT_STATE };
    this.$digits = new Digits($(DOM.digits), this.onClickDigit.bind(this));
    this.$operations = new Operations($(DOM.operations), this.onClickOperation.bind(this));
    this.$modifiers = new Modifiers($(DOM.modifiers), this.onClickModifier.bind(this));
    this.$total = new Total($(DOM.total), this.state.currentTotal);
  }

  setState(nextState) {
    this.state = nextState;
    this.$total.setState(this.state.currentTotal);
  }

  onClickDigit(digit) {
    if (this.state.numberCount >= 3) {
      alert(MESSAGE.numberCanBeEnteredUpToThreeDigitsAtOnce);
      return;
    }

    if (this.$total.isClean()) {
      this.setState({
        currentTotal: digit,
        numberCount: this.state.numberCount + 1,
        lastClickedButton: digit,
      });
    } else {
      this.setState({
        currentTotal: this.state.currentTotal + digit,
        numberCount: this.state.numberCount + 1,
        lastClickedButton: digit,
      });
    }
  }

  onClickModifier(modifier) {
    if (modifier === MODIFIER.allClear) {
      this.setState({ ...INIT_STATE });
    }
  }

  onClickOperation(operation) {
    if (!this.validateWhenClickOperation(operation)) {
      return;
    }

    if (operation === OPERATION.equal) {
      this.evaluateCurrentTotal(this.state.currentTotal);
    } else {
      this.setState({
        currentTotal: this.state.currentTotal + operation,
        numberCount: INIT_STATE.numberCount,
        lastClickedButton: operation,
      });
    }
  }

  validateWhenClickOperation(operation) {
    if (operation === OPERATION.equal && validator.isOperation(this.state.lastClickedButton)) {
      alert(MESSAGE.lastCharacterMustBeNumber);
      return false;
    }
    if (this.$total.isClean()) {
      alert(MESSAGE.pleaseEnterNumberBeforeOperation);
      return false;
    }
    if (validator.isOperation(this.state.lastClickedButton)) {
      alert(MESSAGE.operationCannotBeEnteredConsecutively);
      return false;
    }
    return true;
  }

  evaluateCurrentTotal(currentTotal) {
    let result;
    const operationCountSet = new Set(currentTotal.split('').filter(i => validator.isOperation(i)));

    if (operationCountSet.size === 1) {
      const operationInExpression = extractor.operation(currentTotal);
      const bothSidesOfOperation = currentTotal.split(operationInExpression);
      result = bothSidesOfOperation.reduce((acc, cur) =>
        executor[operationInExpression](Number(acc), Number(cur)),
      );
    } else {
      result = Math.floor(window.Function(`return ${currentTotal.replace('X', '*')}`)());
    }

    this.setState({
      currentTotal: result,
      numberCount: String(result).length,
      lastClickedButton: INIT_STATE.lastClickedButton,
    });
  }
}

export default App;
