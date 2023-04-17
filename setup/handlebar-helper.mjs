// Additional Handlebar helpers

export const handlebarsHelper = function () {
    Handlebars.registerHelper('isAnd', function(cond1, cond2, options) {
      return (cond1 &&  cond2) ? options.fn(this) : options.inverse(this);
    }),
    
    Handlebars.registerHelper('isOr', function(cond1, cond2, options) {
      return (cond1 || cond2) ? options.fn(this) : options.inverse(this);
    })
    
    Handlebars.registerHelper('concat', function() {
      var outStr = '';
      for (var arg in arguments) {
        if (typeof arguments[arg] != 'object') {
          outStr += arguments[arg];
        }
      }
      return outStr;
    });
  
    Handlebars.registerHelper('toLowerCase', function(str) {
      return str.toLowerCase();
    });
  
    Handlebars.registerHelper('loop', function(from, to, inc, block) {
      var output = '';
      for (var i = from; i <= to; i += inc)
        output += block.fn(i);
      return output;
    });

    Handlebars.registerHelper('counter', function (index){
      return index + 1;
  });

  }