var Instruction = function() {
  this.format = undefined;
  
};

var opcodes = {
  // R
  add:  '100000',
  sub:  '100010',
  and:  '100100',
  or:   '100101',

  // I
  addi: '001000',
  andi: '001100',
  ori:  '001101',

  // J
  j:    '000010',
  jr:   '001000',
};

var Component = function(bits, allowNegative) {
  this.bits = bits;  
  var powerResult = Math.pow(2, bits);
  var min, max;
  if (allowNegative) {
    var halfPowerResult = powerResult/2;
    min = halfPowerResult - powerResult;
    max = halfPowerResult - 1;
  } else {
    min = 0;
    max = powerResult - 1;
  }
  this.min = min;
  this.max = max;
};

var componentsParams = {
  rs: new Component(5),
  rt: new Component(5),
  rd: new Component(5),
  shamt: new Component(5),
  funct: new Component(6),
  imm: new Component(16, true),
  addr: new Component(26),
};

var Format = function(format, instructions, components) {
  this.format = format;
  this.instructions = instructions;
  this.components = components;
  var componentsValues = {};
  for (var i in components) {
    var component = components[i];
    componentsValues[component] = ko.observable();
  }
  this.componentsValues = componentsValues;
};

String.prototype.padleft = function(len, chr) {
  var repeats = len - this.length;
  var pad = '';
  for (var i = 0; i < repeats; i++) {
    pad += chr;
  }
  return pad + this;
};

function getBinary(int, bits) {
  if (int>=0) {
    return int.toString(2).padleft(bits, "0");
  }
  return (-int-1).toString(2)
    .replace(/[01]/g, function(d){return +!+d;}) // inverts each char
    .padleft(bits, "1");
};

var ViewModel = function() {

  var self = this;

  this.results = ko.observableArray();
  this.error = ko.observable();
  this.format = ko.observable();

  this.formats = [
    new Format(
      'R', 
      ['add', 'sub', 'and', 'or'],
      ['op', 'rs', 'rt', 'rd', 'shamt', 'funct']
    ),
    new Format(
      'I', 
      ['addi', 'andi', 'ori'],
      ['op', 'rs', 'rt', 'imm']
    ),
    new Format(
      'J', 
      ['j', 'jr'],
      ['op', 'addr']
    ),
  ];

  this.template = function() {
    return this.format().format;
  };

  this.formatLabel = function() {
    return this.format().format + '-Type';
  };

  this.validate = function() {
    var components = this.format().components;
    for (var i in components) {
      var component = components[i];      
      if (component !== 'op') {
        var componentValue = this.format().componentsValues[component]();
        var error = undefined;
        if (!componentValue) {
          error = 'campo não informado';
        } else if (componentValue.length != componentValue.replace(/[^\d-]/g, '').length) {
          error = 'caracter inválido'
        } else if (componentValue < componentsParams[component].min) {
          error = 'menor que valor mínimo';
        } else if (componentValue > componentsParams[component].max) {
          error = 'maior que valor máximo';
        }
        if (error) {
          return {valid: false, component: component, error: error};
        }
      }
    }
    return {valid: true};
  };

  this.enableCompile = function() {
    var currentFormat = this.format();
    for (var i in currentFormat.components) {
      var componentValue = currentFormat.componentsValues[currentFormat.components[i]]();
      if (!componentValue) {
        return false;
      }
    }
    return true;
  };

  this.compile = function() {
    this.error('');
    var validate = this.validate();
    if (!validate.valid) {
      this.error(validate.component + ': ' + validate.error);
      return;
    }

    var result = '';
    var components = this.format().components;
    for (var i in components) {
      var component = components[i];
      if (component === 'op') {
        result += opcodes[this.format().componentsValues[component]()] + ' ';
      } else {
        result += getBinary(parseInt(this.format().componentsValues[component]()), componentsParams[component].bits) + ' ';
      }
    }
    this.results.push(result);
  };

  this.init = function() {
  };
  
  this.init();

};

ko.applyBindings(new ViewModel());