/**
 * Provides Select2 plugin for elements.
 */
(function ($, window, document) {

  String.prototype.extTrim = function (char) {

    var trimRegex = new RegExp('^' + char + '+|' + char + '+$', "g");

    if (trimRegex.test(this)) {
      return this.replace(trimRegex, '');
    }

    return this.toString();
  };
  
  String.prototype.quote_trim = function () {
    var trimRegex = new RegExp('^"(.*)?"$', "g"),
        resultString = this;
    
    while (trimRegex.test(resultString)) {
      resultString = this.replace(trimRegex, '$1');
    }

    return resultString.toString();
  };
  
  String.prototype.regExpReplace = function (rule, replaceValue, ruleFlags) {
    ruleFlags = ruleFlags || 'g';
    var trimRegex = new RegExp(rule, ruleFlags),
        resultString = this;
    
    resultString = this.replace(trimRegex, replaceValue);

    return resultString.toString();
  };
  
  String.prototype.trimDotes = function() {
    return this.extTrim('\\.');
  }
  
  Backdrop.select2functions = Backdrop.select2functions || {};
  
  /**
   * @constructor
   * @this {Backdrop.Select2}
   * @param {DOM} context The context.
   */
  Backdrop.Select2 = function(context) {
    
    /**
     * Current context.
     * @public
     */
    this.context = context;
    
    this.contextSettings = null;
    
    this.Defaults = Backdrop.Select2.Defaults;
    
    this.functionsScopesNames = [
      'Backdrop.Select2.functionsScope',
      'Backdrop.select2functions'
    ];
    
    function setSelect2Defaults () {
      $.extend(true, $.fn.select2.defaults, Backdrop.Select2.Defaults);
      $.extend(true, $.fn.select2.defaults, Backdrop.settings.select_2.default_settings);
    }
    
    setSelect2Defaults();
    
  };
  
  /**
   * Default options for the Select2.
   * @public
   */
  Backdrop.Select2.Defaults = Backdrop.Select2.Defaults || {
    'adaptContainerCssClass': function (className) {
      if (!Backdrop.Select2.Defaults.classesListForCopyFromElement
          && !Backdrop.Select2.Defaults.classesExcludedForCopy) {
        return clazz;
      }
      switch (typeof Backdrop.Select2.Defaults.classesListForCopyFromElement) {
        case 'string':
          if (className == Backdrop.Select2.Defaults.classesListForCopyFromElement) {
            return className;
          }
          break;
        case 'object':
          if ($.inArray(className, Backdrop.Select2.Defaults.classesListForCopyFromElement) >= 0) {
            return className;
          }
          break;
      }
      return false;
    },
    'classesListForCopyFromElement': ['error'],
    'width': 'copy',
    'predefineExcludions': [
      '.tabledrag-hide select'
    ],
  };
  
  Backdrop.Select2.prototype.attachBehaviors = function(element) {
    $.each(Backdrop.behaviors, function () {
      if ($.isFunction(this.select2attach)) {
        this.select2attach(element);
      }
    });
  }
  
  Backdrop.Select2.functionsScope = Backdrop.Select2.functionsScope || {}; 
  
  Backdrop.Select2.functionsScope.baseCreateSearchChoice = function (term) {
    return {
      id: term, 
      text: term
    };
  };
  
  Backdrop.Select2.functionsScope.formatSelectionTaxonomyTermsItem = function (term) {

    if (term.hover_title) {
      return term.hover_title;
    }

    return term.text;
  };
  
  Backdrop.Select2.functionsScope.formatSelection_taxonomy_terms_item = Backdrop.Select2.functionsScope.formatSelectionTaxonomyTermsItem;
  
  Backdrop.Select2.functionsScope.formatResultTaxonomyTermsItem = function (term) {

    var attributes = '';
    var prefix = '';

    if (term.hover_title != undefined) {
      attributes = 'title="' + term.hover_title + '" ';
      prefix = '<span class="visible-on-hover">' + term.hover_title + '</span>';
    }

    return '<span class="taxonomy_terms_item" ' + attributes + '>' + term.text + ' </span>' + prefix;
  };
  
  Backdrop.Select2.functionsScope.formatResult_taxonomy_terms_item = Backdrop.Select2.functionsScope.formatResultTaxonomyTermsItem;
  
  Backdrop.Select2.functionsScope.acFormatResult = function (result) {
    return result.text;
  };
  
  Backdrop.Select2.functionsScope.ac_format_result = Backdrop.Select2.functionsScope.acFormatResult;
  
  Backdrop.Select2.functionsScope.acFielsFormatSelection = function (item) {
    return item.text;
  };
  
  Backdrop.Select2.functionsScope.ac_fiels_FormatSelection = Backdrop.Select2.functionsScope.acFielsFormatSelection;
  
  Backdrop.Select2.functionsScope.acS2InitSelecttion = function (element, callback) {
    var def_values = $(element).select2('val');

    callback({
      id: def_values,
      text: def_values
    });

  };
  
  Backdrop.Select2.functionsScope.entityReferenceInitSelecttion = function (element, callback) {
    var def_values = $(element).select2('val'),
        select2 = $(element).data('select2'),
        select2Options = select2 ? select2.opts : false,
        hideIds = select2Options ? select2Options.hideEntityIds : false,
        comaReplacement = select2Options ? select2Options.comma_replacement : false;

    if (typeof def_values == 'string') {

      var label = def_values;
      label = label.quote_trim().replace(/"{2,}/g, '"');

      if (hideIds) {
        label = label.replace(/\([0-9]+\)$/g, '');
      }
      
      if (comaReplacement) {
        label = label.regExpReplace('{' + comaReplacement + '}', ',');
      }
      
      callback({
        id: def_values,
        text: label
      });
    } else if (typeof (def_values) == 'object') {

      data = [];
      for (var i = 0; i < def_values.length; i++) {

        var label = def_values[i];
        label = label.quote_trim().replace(/"{2,}/g, '"');

        if (hideIds) {
          label = label.replace(/\([0-9]+\)$/g, '');
        }
        
        if (comaReplacement) {
          label = label.regExpReplace('{' + comaReplacement + '}', ',');
        }
        
        data.push({
          id: def_values[i],
          text: label
        });
      }
      callback(data);
    }

  };
  
  Backdrop.Select2.functionsScope.ac_s2_init_selecttion = Backdrop.Select2.functionsScope.acS2InitSelecttion;
  
  Backdrop.Select2.functionsScope.taxonomyTermRefAcS2InitSelecttion = function (element, callback) {

    var def_values = $(element).select2('val');

    if (typeof def_values == 'string') {

      var label = def_values;
      label = label.quote_trim().replace(/{{;}}/g, ',').replace(/"{2,}/g, '"');

      callback({
        id: def_values,
        text: label
      });
    } else if (typeof (def_values) == 'object') {

      data = [];
      for (var i = 0; i < def_values.length; i++) {

        var label = def_values[i];
        label = label.quote_trim().replace(/{{;}}/g, ',').replace(/"{2,}/g, '"');

        data.push({
          id: def_values[i],
          text: label
        });
      }
      callback(data);
    }

  };
  
  Backdrop.Select2.functionsScope.taxonomy_term_ref_ac_s2_init_selecttion = Backdrop.Select2.functionsScope.taxonomyTermRefAcS2InitSelecttion;
  
  Backdrop.Select2.functionsScope.getAjaxObjectForAcElement = function (options) {
    return {
      url: function (term) {
        if (options.path_is_absolute) {
          return options.autocomplete_path + Backdrop.encodePath(term);
        }
        return Backdrop.settings.basePath + options.autocomplete_path + '/' + Backdrop.encodePath(term);
      },
      dataType: 'json',
      quietMillis: 100,
      results: function (data) {
        // notice we return the value of more so Select2 knows if more results can be loaded

        var results_out = [];

        $.each(data, function (id, title) {
          results_out.push({
            id: id,
            text: title
          });
        });

        return {
          results: results_out
        };
      },
      params: {
        error: function (jqXHR, textStatus, errorThrown) {
          if (textStatus == 'abort') {

          }
        }
      }
    };
  };
  
  Backdrop.Select2.functionsScope.ac_element_get_ajax_object = Backdrop.Select2.functionsScope.getAjaxObjectForAcElement;
  
  Backdrop.Select2.prototype.setContext = function(context, settings) {
    this.context = context;
    this.processElements();
  }
  
  Backdrop.Select2.prototype.processElements = function() {
    this.markExcludedElements();
    this.attachSelect2();
  }
  
  Backdrop.Select2.prototype.markExcludedElements = function() {
    
    if (!this.context) return;
    
    $.each(this.Defaults.predefineExcludions, function(index, selector) {
      $(selector, this.context).once('select2-predefined-excludions').addClass('no-select2');
    })
    
    if (Backdrop.settings.select_2.excludes) {
      if (Backdrop.settings.select_2.excludes.by_selectors.length > 0) {
        for (i = 0; i < Backdrop.settings.select_2.excludes.by_selectors.length; ++i) {
          $(Backdrop.settings.select_2.excludes.by_selectors[i], this.context)
          .once('select2-excluded-by-selectors').addClass('no-select2');
        }
      }
      
      if (Backdrop.settings.select_2.excludes.by_class.length > 0) {
        var byClassSelector = Backdrop.settings.select_2.excludes.by_class.join(', .');
        byClassSelector = '.' + byClassSelector;
        try {
          $(byClassSelector, this.context).once('select2-excluded-by-classes').addClass('no-select2');
        } catch (e) {
          throw 'ERROR while setting exlution classes by classes list: ' + e.message;
        }
      }
    }
    
  }
  
  Backdrop.Select2.prototype.attachSelect2 = function() {
    
    if (!this.context) return;
    
    if (Backdrop.settings.select_2.process_all_selects_on_page) {
      $('select', this.context).once('select2-attach').atachSelect2();
    }
    
    $('select.use-select-2, input[type="text"].use-select-2, input[type="hidden"].use-select-2', this.context)
    .once('select2-attach').atachSelect2();
  }
  
  Backdrop.Select2.prototype.attachSelect2ToElement = function($element) {
    
    if ($element.hasClass('no-select2')) return;
    
    var self = this,
        id = $element.attr('id');
    
    $element.id = id;
    
    if (this.checkElementForExclusions($element)) {
      $element.addClass('no-select2');
      return;
    }
    
    var options = Backdrop.settings.select_2.elements[id]
                  ? Backdrop.settings.select_2.elements[id]
                  : {};
    
    options = this.prepareElementOptions(options, $element);
               
    $(document).trigger('select2.alterElementOptions', [$element, options]);
    
    try {
      $element.select2(options);
    } catch (e) {
      if (typeof window.console == "object" && typeof console.error == "function") {
        console.error('Error: ' + e);
        return;
      }
    }
    
    if (options.locked_ids) {
      var settedData = $element.select2('data'),
          needReData = false;
      $.each(settedData, function (index) {
        if ($.inArray(settedData[index].id, options.locked_ids) != -1) {
          settedData[index].locked = true;
          needReData = true;
        }
      });
      
      if (needReData) {
        $element.select2('data', settedData);
      }
    }
    
    Backdrop.Select2Processor.attachBehaviors($element);
    
    var select2Container = false;

    if (options.events_handlers) {
      $.each(options.events_handlers, function (eventName, handlerName) {
        var handler = self.getObjectOrFunctionByName(handlerName);
        if (handler && typeof handler == 'function') {
          $element.on(eventName, handler);
        }
      })
    }
    
    if ($element.data('select2') != undefined) {
      if ($element.data('select2').$container != undefined) {
        select2Container = $element.data('select2').$container;
      } else if ($element.data('select2').container != undefined) {
        select2Container = $element.data('select2').container;
      }
    }
    
    if (select2Container) {
      // need fix select2 container width
      var stylesForFixWidth = ['element', 'copy'],
          cur_width = select2Container.outerWidth();
      if (options.width && $.inArray(options.width, stylesForFixWidth)
          && cur_width <= 6) {
        select2Container.width('auto');
      }
    }
    
    if (select2Container && options.jqui_sortable && $.fn.sortable) {
      select2Container.find("ul.select2-choices").sortable({
        containment: 'parent',
        start: function () {
          $element.select2("onSortStart");
        },
        update: function () {
          $element.select2("onSortEnd");
        }
      });
    }
    
  };
  
  Backdrop.Select2.prototype.searchFunctionInScope = function(functionName) {

    var self = this,
        func = false;
    
    functionName = functionName.toString().trimDotes();
    
    if (functionName.indexOf('.') > -1) {
      if (func = this.getObjectOrFunctionByName(functionName)) {
        return func;
      }
    }
    
    $.each(this.functionsScopesNames, function (index, scopeName) {
      if (func = self.getObjectOrFunctionByName(scopeName + '.' + functionName)) {
        return false;
      }
    });
    
    return func;
  }
  
  Backdrop.Select2.prototype.getObjectPropertyByName = function (obj, prop) {

    if (typeof obj === 'undefined') {
        return false;
    }

    var _index = prop.indexOf('.');
    if (_index > -1) {
        return this.getObjectPropertyByName(obj[prop.substring(0, _index)], prop.substr(_index + 1));
    }

    return obj[prop];
  }
  
  Backdrop.Select2.prototype.getObjectOrFunctionByName = function (name) {
    return this.getObjectPropertyByName(window, name);
  }
  
  Backdrop.Select2.prototype.prepareElementOptions = function(options, $element) {
    var self = this,
        optionsForStringToFunctionConversion = [
          'data', 'ajax', 'query', 'formatResult', 'formatSelection', 
          'initSelection', 'createSearchChoice'
        ],
        elementTagName = $element.prop("tagName"),
        emptyValueOption = $('option[value=""]', $element).length > 0 ? 
                           $($('option[value=""]', $element).get(0)) : 
                           false,
        clearEmptyValueOption = false;
    
    $.each(optionsForStringToFunctionConversion, function (index, propertyName) {
      if (options[propertyName] && typeof options[propertyName] == 'string') {
        var func = self.searchFunctionInScope(options[propertyName]);
        if (func) {
          if (propertyName == 'ajax' && typeof func == 'function') {
            options[propertyName] = func(options);
          } else {
            options[propertyName] = func;
          }
        }
      }
    });
    
    if (options.selectedOnNewLines != undefined && options.selectedOnNewLines) {
      options.containerCssClass += ' one-option-per-line';
    }
    
    if ($element.hasClass('filter-list')) {
      options.allowClear = false;
    }
    
    if (options.allowClear || emptyValueOption) {
      
      if (emptyValueOption) {
        // Checking for empty option exist and set placeholder by its value if
        // placeholder not defined
        if (options.placeholder == undefined) {
          options.placeholder = emptyValueOption.text();
        }
        clearEmptyValueOption = true;
      }
      if (!options.placeholder && !$element.attr('placeholder')) {
        // If placeholder not defined set allowClear option to false
        options.allowClear = false;
      } else if (!options.allowClear) {
        options.allowClear = true;
        if (clearEmptyValueOption) {
          // Clear empty option text
          emptyValueOption.html('');
        }
      }
    }
    
    if (options.allow_add_onfly) {
      options.createSearchChoice = function (term, data) {
        if ($(data).filter(
          function () {
            return this.text.localeCompare(term) === 0;
          }
        ).length === 0) {
          return {
            id: term,
            text: term
          };
        }
      };
    }
    
    if (options.taxonomy_ref_ac_allowed) {
      options.createSearchChoice = function (term, data) {
        if ($(data).filter(
          function () {
            //return this.text.localeCompare(term) === 0;
          }
        ).length === 0) {
          return {
            id: term,
            text: term
          };
        }
      };
    }
    
    if (options.comma_replacement) {
      var cur_val = "" + $element.val();
      cur_val = cur_val.replace(/".*?"/g, function (match) {
        return match.replace(/,/g, '{{;}}');
      });
      $element.val(cur_val);
    }
    
    if (elementTagName == 'SELECT') {
      // disabled_options process
      if (options.disabled_options) {
        $.each(options.disabled_options, function (index, value) {
          $('option[value="' + value + '"]', $element).prop('disabled', true);
        });
      }
      options.jqui_sortable = false;
    }
    
    return options;
  }
  
  /**
   * Check element for matching exclusions rules.
   * @public
   * @param {jQuery object} $element The element that must be checked according to the rules exceptions.
   * @return {Bool} true if element must be skipped and false otherwise.
   */
  Backdrop.Select2.prototype.checkElementForExclusions = function($element) {
    if (!$element.id) return false;
    
    if (!Backdrop.settings.select_2.excludes) {
          return false;
    }    
    
    var excludeIds = Backdrop.settings.select_2.excludes.by_id.values;
    
    
    if ($.inArray($element.id, excludeIds) >= 0) {
      return true;
    } else if (Backdrop.settings.select_2.excludes.by_id.reg_exs.length > 0) {
      // check by regexs for ids
      for (i = 0; i < Backdrop.settings.select_2.excludes.by_id.reg_exs.length; ++i) {
        var regex = new RegExp(Backdrop.settings.select_2.excludes.by_id.reg_exs[i], "ig");

        if (regex.test($element.id)) {
          return true;
        }
      }
    }
    
    return false;
  }
  
  $.fn.atachSelect2 = function () {
    return this.each(function (index) {
      if (!Backdrop.Select2Processor) return;
      
      var $element = $(this);
      
      Backdrop.Select2Processor.attachSelect2ToElement($element);
      
    });
  }
  
  Backdrop.behaviors.select2 = {
    attach: function (context, settings) {
      
      if (typeof ($.fn.select2) == 'undefined') return;
      
      Backdrop.Select2Processor = Backdrop.Select2Processor || new Backdrop.Select2();
      
      if (Backdrop.settings.select_2.settings_updated) {
        Backdrop.Select2Processor.setContext(context);
      }
      else {
        
        Backdrop.settings.select_2.settings_updated = true;
        
        var setting_update_url = Backdrop.settings.basePath + 'select2/ajax/get_settings';
        jqxhr = $.ajax(setting_update_url)
        .done(function (data) {
          if (data) {
            //merging with element defined settings
            try {
              Backdrop.settings.select_2.excludes = data[0].settings.select_2.excludes;
            } catch (e) {
              throw 'ERROR while updating settings for select2: ' + e.message;
            }
          }
        })
        .fail(function () {
          throw 'Select2 setting update ajax request failed.';
        })
        .always(function () {
          Backdrop.Select2Processor.setContext(context);
        });
      }
      
    }
  };
  
})(jQuery, window, document);
