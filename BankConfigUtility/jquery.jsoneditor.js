// Simple yet flexible JSON editor plugin.
// Turns any element into a stylable interactive JSON editor.

// Copyright (c) 2013 David Durman

// Licensed under the MIT license (http://www.opensource.org/licenses/mit-license.php).

// Dependencies:

// * jQuery
// * JSON (use json2 library for browsers that do not support JSON natively)

// Example:

//     var myjson = { any: { json: { value: 1 } } };
//     var opt = { change: function() { /* called on every change */ } };
//     /* opt.propertyElement = '<textarea>'; */ // element of the property field, <input> is default
//     /* opt.valueElement = '<textarea>'; */  // element of the value field, <input> is default
//     $('#mydiv').jsonEditor(myjson, opt);

(function( $ ) {

    $.fn.jsonEditor = function(json, options) {
        options = options || {};
        // Make sure functions or other non-JSON data types are stripped down.
        json = parse(stringify(json));
        
        var K = function() {};
        var onchange = options.change || K;
        var onpropertyclick = options.propertyclick || K;

        return this.each(function() {
            JSONEditor($(this), json, onchange, onpropertyclick, options.propertyElement, options.valueElement);
        });
        
    };
    
    function JSONEditor(target, json, onchange, onpropertyclick, propertyElement, valueElement) {
        var opt = {
            target: target,
            onchange: onchange,
            onpropertyclick: onpropertyclick,
            original: json,
            propertyElement: propertyElement,
            valueElement: valueElement
        };
        construct(opt, json, opt.target);
        $(opt.target).on('blur focus', '.property, .value', function() {
            $(this).toggleClass('editing');
        });
    }

    function isObject(o) { return Object.prototype.toString.call(o) == '[object Object]'; }
    function isArray(o) { return Object.prototype.toString.call(o) == '[object Array]'; }
    function isBoolean(o) { return Object.prototype.toString.call(o) == '[object Boolean]'; }
    function isNumber(o) { return Object.prototype.toString.call(o) == '[object Number]'; }
    function isString(o) { return Object.prototype.toString.call(o) == '[object String]'; }
    var types = 'object array boolean number string null';

    // Feeds object `o` with `value` at `path`. If value argument is omitted,
    // object at `path` will be deleted from `o`.
    // Example:
    //      feed({}, 'foo.bar.baz', 10);    // returns { foo: { bar: { baz: 10 } } }
    function feed(o, path, value) {
        var del = arguments.length == 2;
        
        if (path.indexOf('.') > -1) {
            var diver = o,
                i = 0,
                parts = path.split('.');
            for (var len = parts.length; i < len - 1; i++) {
                diver = diver[parts[i]];
            }
            if (del) delete diver[parts[len - 1]];
            else diver[parts[len - 1]] = value;
        } else {
            if (del) delete o[path];
            else o[path] = value;
        }
        return o;
    }

    // Get a property by path from object o if it exists. If not, return defaultValue.
    // Example:
    //     def({ foo: { bar: 5 } }, 'foo.bar', 100);   // returns 5
    //     def({ foo: { bar: 5 } }, 'foo.baz', 100);   // returns 100
    function def(o, path, defaultValue) {
        path = path.split('.');
        var i = 0;
        while (i < path.length) {
            if ((o = o[path[i++]]) == undefined) return defaultValue;
        }
        return o;
    }

    function error(reason) { if (window.console) { console.error(reason); } }
    
    function parse(str) {
        var res;
        try { res = JSON.parse(str); }
        catch (e) { res = null; error('JSON parse failed.'); }
        return res;
    }

    function stringify(obj) {
        var res;
        try { res = JSON.stringify(obj); }
        catch (e) { res = 'null'; error('JSON stringify failed.'); }
        return res;
    }
    
    function addExpander(item) {
        if (item.children('.expander').length == 0) {
            var expander =   $('<span>',  { 'class': 'expander' });
            expander.bind('click', function() {
                var item = $(this).parent();
                item.toggleClass('expanded');
            });
            item.prepend(expander);
        }
    }

    function addListExpander(item) {
        if (item.children('.expander').length == 0) {
            var expander =   $('<span>',  { 'class': 'expander' });
            expander.bind('click', function() {
                var item = $(this).parent();
                item.toggleClass('expanded');
            });
            item.prepend(expander);
        }
    }

    function addListAppender(item, handler) {
        var appender = $('<div>', { 'class': 'listItem appender' }),
            btn      = $('<button></button>', { 'class': 'property' });

        btn.text('Add New Value');

        appender.append(btn);
        item.append(appender);

        btn.click(handler);

        return appender;
    }

    function addListDeleter(item, handler) {
        var appender = $('<div>', { 'class': 'listItem appender' }),
            btn      = $('<button></button>', { 'class': 'property' });

        btn.text('del');

        appender.append(btn);
        item.append(appender);

        btn.click(handler);

        return appender;
    }

    function addNewValue(json) {
        if (isArray(json)) {

            // Create the new object
            var listitemObj = {"id":"","Description":""}

            // Push as an array
            json.push(listitemObj)
        }
        return false;
    }
    
    function construct(opt, json, root, path) {
        path = path || '';
        
        root.children('.item').remove();
        root.children('.listItem').remove();
        
        for (var key in json) {

            if (!json.hasOwnProperty(key)) continue;

            var isListItemNode

            // JK TOD just check if this is an array ? RequiredMCCGroups
            if ((path.indexOf('ListItems') != -1 || path.indexOf('MCCGroups.MCCGActions') != -1  || path.indexOf('MCCGroups.RequiredMCCGroups') != -1 || path.indexOf('MCCGroups.MCCGroups') != -1)){
                isListItemNode = true;
            }else{
                isListItemNode = false;
            }

            var item

            switch (key)
            {
                case '_id':
                case '_rev':
                case 'WebServiceMethod':
                case 'UiFieldsTranslationKey':
                case 'WsField':
                case 'ToolTipTranslationKey':
                case 'ListItemTranslationKey':
                case 'Generated':
                case 'TranslationKey':
                //case '_deleted_conflicts':
                // Hidden
                    item     = $('<div>',   { 'class': 'item', 'data-path': path }),
                    property =   $(opt.propertyElement || '<input type="hidden">', { 'class': 'property' }),
                    value    =   $(opt.valueElement || '<input type="hidden">', { 'class': 'value'    });
                    break;

                case 'Allow Company Admin to configure': 
                case 'Allow Bank Implementor to configure':
                case 'Tier1VisaImplementCanConfigure' :
                // Boolean
                    item     =  $('<div>',   { 'class': 'item', 'data-path': path }),
                    property =   $(opt.propertyElement || '<input>', { 'class': 'property' }),
                    value    =   $(opt.valueElement || '<input>', { 'class': 'value valueHidden'}),

                    // Control
                    control    = $(opt.valueElement || '<input>', { 'class': 'control','type':'checkbox','checked':json[key]}); // Also set value
                    break;

                case 'Field Rule':
                // Radio
                    item     =  $('<div>',   { 'class': 'item', 'data-path': path }),
                    property =   $(opt.propertyElement || '<input>', { 'class': 'property' }),
                    value    =   $(opt.valueElement || '<input>', { 'class': 'value valueHidden'});

                    // Give this radio button group a unique name
                    var uniqueName  = 'UIField'
                    uniqueName += json['UiFieldsTranslationKey'];

                    control = $('<input>', { 'class': 'control','type':'radio','name':uniqueName,'value':'Mandatory'});
                    label = $( '<label></label>', {'class': 'label' }); // TODO label For
                    label.text('Mandatory');
                    if (json[key] == 'Mandatory')
                    {control.prop('checked',true);}

                    control1 = $('<input>', { 'class': 'control','type':'radio','name':uniqueName,'value':'Optional' });
                    label1 = $( '<label></label>', {'class': 'label' }); // TODO label For
                    label1.text('Optional');
                    if (json[key] == 'Optional')
                    {control1.prop('checked',true);}

                    control2 = $('<input>', { 'class': 'control','type':'radio','name':uniqueName,'value':'Suppressed' });
                    label2 = $( '<label></label>', {'class': 'label' }); // TODO label For
                    label2.text('Suppressed');
                    if (json[key] == 'Suppressed')
                    {control2.prop('checked',true);}

                    control3 = $('<input>', { 'class': 'control','type':'radio','name':uniqueName,'value':'ReadOnly' });
                    label3 = $( '<label></label>', {'class': 'label' }); // TODO label For
                    label3.text('ReadOnly');
                    if (json[key] == 'ReadOnly')
                    {control3.prop('checked',true);}

                    control4 = $('<input>', { 'class': 'control','type':'radio','name':uniqueName,'value':'Editable' });
                    label4 = $( '<label></label>', {'class': 'label' }); // TODO label For
                    label4.text('Editable');
                    if (json[key] == 'Editable')
                    {control4.prop('checked',true);}

                    break;

                // Free Text
                default:

                    if (isListItemNode) {
                        item     =  $('<div>',   { 'class': 'listItem litem ', 'data-path': path }),
                            property =   $(opt.propertyElement || '<input>', { 'class': 'property liProperty' }),
                            value    =   $(opt.valueElement || '<input>', { 'class': 'value liValue'    });
                            button = $(opt.propertyElement || '<button></button>', { 'class': 'buttonDelete' });
                            button.text('delete');
                            button.click(valueDeleteClicked(opt));

                    }else{

                        item     =  $('<div>',   { 'class': 'item', 'data-path': path }),
                            property =   $(opt.propertyElement || '<input>', { 'class': 'property' }),
                            value    =   $(opt.valueElement || '<input>', { 'class': 'value'    });
                    }
                    break;
            }

                if (isObject(json[key]) && isListItemNode == false ){
                    addExpander(item);
                }
                
                // Don't append the value if this is a web service field container field'
                if (isObject(json[key]) || isArray(json[key]) ) {

                    if (isListItemNode == false)
                    {
                        item.append(property);
                    }

                }else{

                    switch (key)
                    {
                        //Boolean
                        case 'Tier3CompanyAdminCanConfigure':
                        case 'Allow Bank Implementor to configure':
                        case 'Allow Company Admin to configure':
                            item.append(property).append(value).append(control);
                            break;

                        // Option (radio)
                        case 'Field Rule':
                            item.append(property).append(value)

                            item.append(control);
                            item.append(label);

                            item.append(control1);
                            item.append(label1);

                            item.append(control2);
                            item.append(label2);

                            item.append(control3);
                            item.append(label3);

                            item.append(control4);
                            item.append(label4);

                            break;

                        // Normal Text Box
                        default:
                            item.append(property).append(value);

                            break;

                    }
                }

                // Append the delete button to the first property of the listItem
                 if (isListItemNode == true && ( key == 'Id'|| key == 'id')) // JK TODO
                    {
                        item.prepend(button);
                    }

                root.append(item);
            
                property.val(key).attr('title', key);

                var val = stringify(json[key]);
                value.val(val).attr('title', val);

                assignType(item, json[key]);

                    switch (key)
                    {
                        case 'Tier3CompanyAdminCanConfigure':
                        case 'Allow Bank Implementor to configure':
                        case 'Allow Company Admin to configure':
                            value.change(valueChanged(opt));
                            control.change(controlClicked(opt));
                            break;

                        case 'Field Rule':
                            value.change(valueChanged(opt));
                            control.change(optionClicked(opt));
                            control1.change(optionClicked(opt));
                            control2.change(optionClicked(opt));
                            control3.change(optionClicked(opt));
                            control4.change(optionClicked(opt));
                            break;

                        default:

                            value.change(valueChanged(opt));
                            break;
                    }

                if ( (isObject(json[key]) || isArray(json[key])) ) {
                    construct(opt, json[key], item, (path ? path + '.' : '') + key);
                }
        }

        if (isArray(json)) {
            addListAppender(root, function () {
                addNewValue(json);
                construct(opt, json, root, path);
                opt.onchange(parse(stringify(opt.original)));
            })
        }
    }

    function updateParents(el, opt) {
        $(el).parentsUntil(opt.target).each(function() {
            var path = $(this).data('path');
           //path = (path ? path + '.' : path) + $(this).children('.property').val();
            
            path = (path ? path + '.' : path) + $(this).children('.property').attr('title');
            var val = stringify(def(opt.original, path, null));
            $(this).children('.value').val(val).attr('title', val);
        });
    }

    function valueChanged(opt) {
        return function() {
            var key = $(this).prev().val(),
               val = parse($(this).val() || 'null'),
               //val = $(this).val(),
                item = $(this).parent(),
                path = item.data('path');

            feed(opt.original, (path ? path + '.' : '') + key, val);
            if ((isObject(val) || isArray(val)) && !$.isEmptyObject(val)) {
                construct(opt, val, item, (path ? path + '.' : '') + key);
                addExpander(item);
            } else {
                item.find('.expander, .item').remove();
            }

            assignType(item, val);

            updateParents(this, opt);
            
            opt.onchange(parse(stringify(opt.original)));
        };
    }

    function controlClicked(opt) {
        return function() {

            var check = $(this).parent().children('.control').prop('checked');

            // CheckBox Update sibling text box value
            if (check == true)
            {    $(this).parent().children('.value').val('true');
            }else{
                 $(this).parent().children('.value').val('false');
            }

            // Trigger onchange to update underlying json data
            $(this).parent().children('.value').trigger("change");
        }
    }

    function valueDeleteClicked (opt) {
        return function() {
        alert(opt.toString());

        }
    }

    function optionClicked(opt) {
            return function() {

            var option = $(this).parent().children('.control');

            var checkedValue = option.filter(':checked').val();

            $(this).parent().children('.value').val('"' + checkedValue + '"');

            // Trigger onchange to update underlying json data
            $(this).parent().children('.value').trigger("change");

        }

    }

    function assignType(item, val) {
        var className = 'null';
        
        if (isObject(val)) className = 'object';
        else if (isArray(val)) className = 'array';
        else if (isBoolean(val)) className = 'boolean';
        else if (isString(val)) className = 'string';
        else if (isNumber(val)) className = 'number';

        item.removeClass(types);
        item.addClass(className);
    }

})( jQuery );
