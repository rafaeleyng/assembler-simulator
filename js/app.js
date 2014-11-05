var Operation = function(operation, type, components, template) {
  this.operation = operation;
  this.type = type;
  this.template = template ? template : type;
  this.op = components.op;
  this.funct = components.funct;
  this.shamt = components.shamt;
  this.op = components.op;
};

var immediateBits = {
  I: 16,
  J: 26,
};

var registersToValidate = {
  R: ['rs', 'rt', 'rd'], 
  I1: ['rs', 'rt'],
  I2: ['rs', 'rt'],
}

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

String.prototype.padleft = function(len, chr) {
  var repeats = len - this.length;
  var pad = '';
  for (var i = 0; i < repeats; i++) {
    pad += chr;
  }
  return pad + this;
};

function getRange(bits) {
  var pow = Math.pow(2, bits);
  var half = pow/2;
  var min = -half;
  var max = half - 1;
  return {min: min, max: max};  
};

function validateRange(number, bits) {
  var range = getRange(bits);
  return range.min <= number && number <= range.max; 
};

function intToBinary(int, bits) {
  int = parseInt(int);
  if (int>=0) {
    return int.toString(2).padleft(bits, "0");
  }
  return (-int-1).toString(2)
    .replace(/[01]/g, function(d){return +!+d;}) // inverts each char
    .padleft(bits, "1");
};

var regToBinary = function(reg) {
  var index = registers.indexOf(reg);
  return intToBinary(index, 5);
}

var operations = [
  new Operation('add', 'R', {op: '000000', shamt: '00000', funct: '100000'}),
  new Operation('sub', 'R', {op: '000000', shamt: '00000', funct: '100010'}),
  new Operation('and', 'R', {op: '000000', shamt: '00000', funct: '100100'}),
  new Operation('or',  'R', {op: '000000', shamt: '00000', funct: '100101'}),
  // new Operation('not', 'R', {op: '000000', shamt: '00000', funct: ''}),
  new Operation('slt', 'R', {op: '000000', shamt: '00000', funct: '101010'}),

  new Operation('addi', 'I', {op: '001000'}, 'I1'),
  // new Operation('subi', 'I', {op: ''}, 'I1'),
  new Operation('andi', 'I', {op: '001100'}, 'I1'),
  new Operation('ori',  'I', {op: '001101'}, 'I1'),
  // new Operation('noti', 'I', 'I1'),
  new Operation('slti', 'I', {op: '001010'}, 'I1'),
  new Operation('beq',  'I', {op: '000100'}, 'I1'),

  new Operation('lw', 'I', {op: '100011'}, 'I2'),
  new Operation('sw', 'I', {op: '101011'}, 'I2'),

  new Operation('j', 'J', {op: '000010'}),
];

var Instruction = function() {
  var self = this;

  this.operation = ko.observable();

  this.template = function() {
    return this.operation().template;
  }

  this.rs = ko.observable();
  this.rt = ko.observable();
  this.rd = ko.observable();
  this.imm = ko.observable();
  this.addr = ko.observable();

};

var assemblyStrForInstruction = function(instruction) {
  var template = instruction.operation().template;
  var type = instruction.operation().type;

  var imm = Number(instruction.imm());
  var op = instruction.operation().operation;
  var rd = instruction.rd();
  var rs = instruction.rs();
  var rt = instruction.rt();

  if (template === 'R') {
    format = ':0 :1, :2, :3';     
    return format
    .replace(':0', op)
    .replace(':1', rd)
    .replace(':2', rs)
    .replace(':3', rt)
    ;
  } 
  if (template === 'I1') {
    format = ':0 :1, :2, :3';
    return format
    .replace(':0', op)
    .replace(':1', rt)
    .replace(':2', rs)
    .replace(':3', imm)
    ;
  }
  if (template === 'I2') {
    format = ':0 :1, :2(:3)';
    return format
    .replace(':0', op)
    .replace(':1', rt)
    .replace(':2', imm)
    .replace(':3', rs)
    ;
  }
  if (template === 'J') {
    format = ':0 :1';
    return format
    .replace(':0', op)
    .replace(':1', imm)
    ;
  }
};

var assemblyStrToAssemblyObj = function(string) {
  var parts = string
  .replace(new RegExp('[,)]', 'g'), '')
  .replace('(', ' ')
  .split(' ')
  ;

  var errorMessage = 'Invalid expression, too many symbols';

  if (parts.length > 4) {
    throw errorMessage;
  }

  var op = parts[0];
  var operation = getOperationWithName(op);
  var template = operation.template;

  if (template === 'R') {
    return {
      op: op,
      rd: parts[1],
      rs: parts[2],
      rt: parts[3]
    };
  }
  if (template === 'I1') {
    return {
      op: op,
      rt: parts[1],
      rs: parts[2],
      imm: parts[3]
    };
  }
  if (template === 'I2') {
    return {
      op: op,
      rt: parts[1],
      imm: parts[2],
      rs: parts[3]
    };
  }
  if (template === 'J') {
    if (parts.length > 2) {
      throw errorMessage;
    }    
    return {
      op: op,
      imm: parts[1]
    };
  }
};

var getOperationWithName = function(op) {
  for (var i in operations) {
    if (operations[i].operation === op) {
      return operations[i];
    }
  }
  throw "Unsuported op";
};

var isCollection = function(obj) {
  return Object.prototype.toString.call([]).substr(8, 5) === 'Array';
};

var areValidRegisters = function(assemblyObj, regs) {

  if (regs === undefined) {
    return true;
  }

  regs = isCollection(regs) ? regs : [regs];
  for (var i in regs) {
    var reg = assemblyObj[regs[i]];
    var index = registers.indexOf(reg);
    if (index === -1) {
      return false;
    }
  }
  return true;
};

var validateAssemblyObj = function(assemblyObj, operation) {

  var template = operation.template;
  var type = operation.type;

  var regsToValidate = registersToValidate[template];
  debugger
  if (!areValidRegisters(assemblyObj, regsToValidate)) {
    throw 'Invalid registers';    
  }

  if (type === 'R') {
    return;
  }

  var imm = assemblyObj.imm;

  if (Number.isNaN(imm) || imm === 'NaN') {
    throw 'Invalid imm';
  }

  var bits = immediateBits[type];
  var range = getRange(bits);
  if (!validateRange(imm, bits)) {
    throw 'imm overflow: min :min, max :max'.replace(':min', range.min).replace(':max', range.max);
  }
};

var compileAssemblyObj = function(assemblyObj) {

  var operation = getOperationWithName(assemblyObj.op);

  validateAssemblyObj(assemblyObj, operation);

  var type = operation.type;

  if (type === 'R') {
    return ':0 :1 :2 :3 :4 :5'
    .replace(':0', operation.op)
    .replace(':1', regToBinary(assemblyObj.rs))
    .replace(':2', regToBinary(assemblyObj.rt))
    .replace(':3', regToBinary(assemblyObj.rd))
    .replace(':4', operation.shamt)
    .replace(':5', operation.funct)
    ;
  }

  if (type === 'I') {
    return ':0 :1 :2 :3'
    .replace(':0', operation.op)
    .replace(':1', regToBinary(assemblyObj.rs))
    .replace(':2', regToBinary(assemblyObj.rt))
    .replace(':3', intToBinary(assemblyObj.imm, 16))
    ;
  } 

  if (type === 'J') {
    return ':0 :1'
    .replace(':0', operation.op)
    .replace(':1', intToBinary(assemblyObj.imm, 26))
    ;
  }
};





var ViewModel = function() {

  var self = this;

  this.tabs = {
    text: 0,
    fields: 1,
  };

  this.results = {
    compiled: ko.observable(''),
    assembly: ko.observable(''),
    signals: ko.observable(''),
  };

  this.error = ko.observable('');

  this.instructions = ko.observableArray();
  this.instructions.push(new Instruction());
  this.operations = ko.observableArray(operations);
  this.textarea = ko.observable();

  this.compileAssemblyStr = function(assemblyStr, resultsObj, index) {

    try {
      var assemblyObj = assemblyStrToAssemblyObj(assemblyStr);
      var compiled = compileAssemblyObj(assemblyObj);      
    } catch (e) {
      throw '[line :0: \':1\'] :2'.replace(':0', index + 1).replace(':1', assemblyStr).replace(':2', e);
    }

    console.log(assemblyStr);
    console.log(compiled);

    resultsObj.assembly += assemblyStr + '\n';
    resultsObj.compiled += compiled + '\n';
    resultsObj.signals += 'signals \n';    
  };

  this.compileFromText = function() {
    var text = this.textarea();

    if (!text || text === '') {
      throw 'Empty expression';
    }

    var results = {
      assembly: '',
      compiled: '',
      signals: '',
    };
    var lines = text.split('\n');
    for (var i in lines) {
      var assemblyStr = lines[i];
      this.compileAssemblyStr(assemblyStr, results, parseInt(i));
    }
    return results;
  };

  this.compileFromFields = function() {
    var results = {
      assembly: '',
      compiled: '',
      signals: '',
    };
    for (var i in this.instructions()) {      
      var assemblyStr = assemblyStrForInstruction(this.instructions()[i]);
      this.compileAssemblyStr(assemblyStr, results, parseInt(i));
    }
    return results;
  };

  this.compile = function() {
    this.cleanError();
    this.cleanResults();
    try {
      var results = this.selectedTab() === this.tabs.text ? this.compileFromText() : this.compileFromFields();
      this.results.assembly(results.assembly);
      this.results.compiled(results.compiled);
      this.results.signals(results.signals);
    } catch (e) {
      this.error(e);
    }
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

  this.cleanError = function() {
    this.error('');
  };

  this.cleanResults = function() {
    this.cleanError();    
    for (var i in this.results) {
      this.results[i]('');
    }
  };

  // tabs
  this.selectedTab = ko.observable(0);
  this.selectTab = function(tab) {
    this.selectedTab(tab);
  };
  this.isSelectedTab = function(tab) {
    return this.selectedTab() === tab;
  };

  this.init = function() {

  };
  
  this.init();
};

ko.applyBindings(new ViewModel());