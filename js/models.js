var app = app || {};

app.Model = {};

app.Model.Operation = function(operation, type, components, template) {
  this.operation = operation;
  this.type = type;
  this.template = template ? template : type;
  this.opcode = components.opcode;
  this.funct = components.funct;
  this.shamt = components.shamt;
};

app.Model.Instruction = function() {
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