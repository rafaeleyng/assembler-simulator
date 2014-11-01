var Operation = function(operation, type, template) {
  this.operation = operation;
  this.type = type;
  this.template = template ? template : type;
};

var operations = [
  new Operation('add', 'R'),
  new Operation('sub', 'R'),
  new Operation('and', 'R'),
  new Operation('or', 'R'),
  new Operation('not', 'R'),
  new Operation('slt', 'R'),

  new Operation('addi', 'I', 'I1'),
  new Operation('subi', 'I', 'I1'),
  new Operation('andi', 'I', 'I1'),
  new Operation('ori', 'I', 'I1'),
  new Operation('noti', 'I', 'I1'),
  new Operation('slti', 'I', 'I1'),
  new Operation('beq', 'I', 'I1'),

  new Operation('lw', 'I', 'I2'),
  new Operation('sw', 'I', 'I2'),

  new Operation('j', 'J')
];


var Instruction = function() {
  var self = this;

  this.operation = ko.observable();
  this.operations = ko.observableArray(operations);

  this.template = function() {
    return this.operation().template;
  }

  this.components = [];
};

var registers = [
  '$0',
  '$at',
  '$v0',
  '$v1',
  '$a0',
  '$a1',
  '$a2',
  '$a3',
  '$t0',
  '$t1',
  '$t2',
  '$t3',
  '$t4',
  '$t5',
  '$t6',
  '$t7',
  '$s0',
  '$s1',
  '$s2',
  '$s3',
  '$s4',
  '$s5',
  '$s6',
  '$s7',
  '$t8',
  '$t9',
  '$k0',
  '$k1',
  '$gp',
  '$sp',
  '$fp',
  '$ra',
];

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

var ViewModel = function() {

  var self = this;

  this.results = ko.observableArray();

  this.instructions = ko.observableArray();
  this.instructions.push(new Instruction());

  this.compile = function() {
    console.log('compiling');  
  };

  this.clickAdd = function(index) {
    this.instructions.splice(index + 1, 0, new Instruction());
  };

  this.clickRemove = function(index) {
    this.instructions.splice(index, 1);
  };

  this.enableRemove = function() {
    return this.instructions().length !== 1;
  };

  this.init = function() {

  };
  
  this.init();
};

ko.applyBindings(new ViewModel());