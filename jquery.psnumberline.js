/*********************************************************
 * psnumberline.js
 * jQuery-plugin for creating a numberline
 * Petri Salmela
 * pesasa@iki.fi
 * 05.08.2012
 *
 * License: WTFPL
 *    http://sam.zoy.org/wtfpl/COPYING
 ********************************************************/

testilogit = {};


(function($){
    // jQuery plugin
    $.fn.psnumberline = function(options){
        // Test for numberline actions
        if (typeof(options) === 'string'){
            this.trigger(options, [arguments[1]]);
            return true;
        }
        // Extend default settings with user given options.
        var settings = $.extend({
            min: -10,
            max: 10,
            width: 'auto',
            linewidth: 1,
            theme: "psnl_default"       // html class for styling
        }, options);
        settings.min = parseInt(settings.min);
        settings.max = parseInt(settings.max);

        // Return this so that methods of jQuery element can be chained.
        return this.each(function(){
            // Create new Psnumberline object.
            var numberline = new Psnumberline(this, settings);
            // Init the numberline.
            numberline.init();
        });
    }
    
    Psnumberline = function(place, settings){
        // Constructor for Psnumberline object.
        this.settings = settings;
        this.place = $(place);
        this.place.addClass('psnumberline');
        this.points = {};
        this.ypos = 30;
    }
    
    Psnumberline.prototype.init = function(){
        var numberline = this;
        if (this.place.hasClass('psnl_rendered')){
            return false;
        }
        if (this.settings.width == 'auto'){
            this.width = this.place.width();
        } else {
            this.width = this.settings.width;
        }
        this.place.addClass('psnl_rendered').addClass(this.settings.theme);
        var nlinetext = [Psnumberline.strings.svgstart, Psnumberline.strings.numberline, Psnumberline.strings.svgend].join('');
        this.nlinenumber = -1;
        while (jQuery('#numberline_'+(++this.nlinenumber)).length > 0){};
        var numofsteps = this.settings.max - this.settings.min;
        var smallstep = this.stepsize = (this.width - 10)/numofsteps;
        this.zero = -this.settings.min * smallstep +5;
        var smallsteplist = [];
        var bigstep = (5 - (((this.settings.min % 5) + 5) % 5)) * smallstep;
        var bigsteplist = [];
        for (var i = this.settings.min + 1; i < this.settings.max + 1; i++){
            smallsteplist.push(smallstep + ',0');
            if (i % 5 == 0){
                bigsteplist.push(bigstep + ',0');
                bigstep = 5*smallstep;
            }
        }
        nlinetext = nlinetext.replace('{{{nlineboxwidth}}}',this.width)
            .replace('{{{nlinenumber}}}', this.nlinenumber)
            .replace('{{{nlinestopssmall}}}', smallsteplist.join(' '))
            .replace('{{{nlinestopslarge}}}', bigsteplist.join(' '))
            .replace('{{{nlinewidth}}}', this.settings.linewidth);
        this.place.html(nlinetext);
        this.svg = this.place.find('svg')[0];
        this.initEvents();
        return this;
    }
    
    Psnumberline.prototype.addPoint = function(options){
        var point = new Psnlpoint(options);
        this.points[options.name] = point;
        this.addPointSvg(point);
        return this;
    }
    
    Psnumberline.prototype.addPointSvg = function(point){
        var group = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        group.setAttributeNS(null, 'transform', 'translate('+ this.valuetoxpos(point.value())+','+this.ypos+')');
        switch (point.options.shape){
            case 'o':
                var dot = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
                dot.setAttributeNS(null, 'cy', 0);
                dot.setAttributeNS(null, 'cx', 0);
                dot.setAttributeNS(null, 'r', point.options.size);
                dot.setAttributeNS(null, 'stroke', 'black');
                dot.setAttributeNS(null, 'stroke-width', 2);
                dot.setAttributeNS(null, 'fill', point.options.color);
                break;
            case '[]':
                var dot = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
                dot.setAttributeNS(null, 'y', -point.options.size);
                dot.setAttributeNS(null, 'x', -point.options.size);
                dot.setAttributeNS(null, 'width', 2*point.options.size);
                dot.setAttributeNS(null, 'height', 2*point.options.size);
                dot.setAttributeNS(null, 'stroke', 'black');
                dot.setAttributeNS(null, 'stroke-width', 2);
                dot.setAttributeNS(null, 'fill', point.options.color);
                break;
            case '<>':
                var dot = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
                var points = [
                    0 + ',' + -point.options.size,
                    point.options.size + ',' + 0,
                    0 + ',' + point.options.size,
                    -point.options.size + ',' + 0
                ];
                dot.setAttributeNS(null, 'points', points.join(' '));
                dot.setAttributeNS(null, 'stroke', 'black');
                dot.setAttributeNS(null, 'stroke-width', 2);
                dot.setAttributeNS(null, 'fill', point.options.color);
                break;
            case 'x':
                var dot = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
                var points = [
                    0 + ',' + -1,
                    point.options.size + ',' + -point.options.size,
                    1 + ',' + 0,
                    point.options.size + ',' + point.options.size,
                    0 + ',' + 1,
                    -point.options.size + ',' + point.options.size,
                    -1 + ',' + 0,
                    -point.options.size + ',' + -point.options.size
                ];
                dot.setAttributeNS(null, 'points', points.join(' '));
                dot.setAttributeNS(null, 'stroke', point.options.color);
                dot.setAttributeNS(null, 'stroke-width', 1);
                dot.setAttributeNS(null, 'fill', point.options.color);
                break;
            case '+':
                var dot = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
                var points = [
                    1 + ',' + -1,
                    point.options.size + ',' + 0,
                    1 + ',' + 1,
                    0 + ',' + point.options.size,
                    -1 + ',' + 1,
                    -point.options.size + ',' + 0,
                    -1 + ',' + -1,
                    0 + ',' + -point.options.size
                ];
                dot.setAttributeNS(null, 'points', points.join(' '));
                dot.setAttributeNS(null, 'stroke', point.options.color);
                dot.setAttributeNS(null, 'stroke-width', 2);
                dot.setAttributeNS(null, 'fill', point.options.color);
                break;
            default:
                break;
        }
        group.appendChild(dot);
        this.svg.appendChild(group);
        point.svg = group;
    }
    
    Psnumberline.prototype.move = function(name, value){
        this.points[name].move(this.valuetoxpos(value));
        return this;
    }
    
    Psnumberline.prototype.remove = function(name){
        this.svg.removeChild(this.points[name].svg);
        delete this.points[name];
        return this;
    }
    
    Psnumberline.prototype.initEvents = function(){
        var nline = this;
        this.place.bind('addpoint', function(e, options){
            nline.addPoint(options);
        });

        this.place.bind('movepoint', function(e, options){
            nline.move(options.name, options.value);
        });        
    }
    
    Psnumberline.prototype.xpostovalue = function(xpos){
        return (xpos - this.zero) / this.stepsize;
    }
        
    Psnumberline.prototype.valuetoxpos = function(value){
        return this.zero + value * this.stepsize;
    }
        
    
    Psnumberline.strings = {
        svgstart: '<svg xmlns="http://www.w3.org/2000/svg" version="1.1" width="{{{nlineboxwidth}}}" height="60" id="numberline_{{{nlinenumber}}}">'
            + '<defs> <marker refX="0" refY="0" orient="auto" id="StopL" style="overflow:visible"> <path d="M 0,5.65 0,-5.65" transform="scale(1,1)" style="fill:none;stroke:#000000;stroke-width:1pt" /></marker>'
            + '<marker refX="0" refY="0" orient="auto" id="StopM" style="overflow:visible"> <path d="M 0,5.65 0,-5.65" transform="scale(0.4,0.4)" style="fill:none;stroke:#000000;stroke-width:1pt" /> </marker>'
            + '<marker refX="0" refY="0" orient="auto" id="DotM" style="overflow:visible"> <path d="m -2.5,-1 c 0,2.76 -2.24,5 -5,5 -2.76,0 -5,-2.24 -5,-5 0,-2.76 2.24,-5 5,-5 2.76,0 5,2.24 5,5 z" transform="matrix(0.4,0,0,0.4,2.96,0.4)" style="fill-rule:evenodd;stroke:#000000;stroke-width:1pt" /> </marker>'
            + '<marker refX="0" refY="0" orient="auto" id="DistanceStart" style="overflow:visible"> <g id="g2300"> <path d="M 0,0 2,0" id="path2306" style="fill:none;stroke:#ffffff;stroke-width:1.14999998; stroke-linecap:square" /> <path d="M 0,0 13,4 9,0 13,-4 0,0 z" id="path2302" style="fill:#000000;fill-rule:evenodd;stroke:none" /> <path d="M 0,-4 0,40" id="path2304" style="fill:none;stroke:#000000;stroke-width:1;stroke-linecap:square" /> </g> </marker>'
            + '<marker refX="0" refY="0" orient="auto" id="Arrow1Lend" style="overflow:visible"> <path d="M 0,0 0,-4 -12.5,0 0,4 0,0 z" transform="matrix(-0.8,0,0,-0.8,-8,0)" id="path3762" style="fill-rule:evenodd;stroke:#000000;stroke-width:0pt" /> </marker>'
            + '<marker refX="0" refY="0" orient="auto" id="Arrow1Lstart" style="overflow:visible"> <path d="M 0,0 0,-4 -12.5,0 0,4 0,0 z" transform="matrix(0.8,0,0,0.8,8,0)" id="path3759" style="fill-rule:evenodd;stroke:#000000;stroke-width:0pt" /> </marker> </defs>',
//             + '<marker refX="0" refY="0" orient="auto" id="Arrow1Lend" style="overflow:visible"> <path d="M 0,0 5,-5 -12.5,0 5,5 0,0 z" transform="matrix(-0.8,0,0,-0.8,-10,0)" id="path3762" style="fill-rule:evenodd;stroke:#000000;stroke-width:1pt" /> </marker>'
//             + '<marker refX="0" refY="0" orient="auto" id="Arrow1Lstart" style="overflow:visible"> <path d="M 0,0 5,-5 -12.5,0 5,5 0,0 z" transform="matrix(0.8,0,0,0.8,10,0)" id="path3759" style="fill-rule:evenodd;stroke:#000000;stroke-width:1pt" /> </marker> </defs>',
        svgend: '</svg>',
        numberline: '<path d="m 5.0,30.0 {{{nlinestopssmall}}}" style="fill:none;stroke:#000000;stroke-width:{{{nlinewidth}}}px;stroke-linecap:butt;stroke-linejoin:miter;stroke-opacity:1;marker-start:url(#Arrow1Lstart);marker-mid:url(#StopM);marker-end:url(#Arrow1Lend)" />'
            + '<path d="m 5.0,30.0 {{{nlinestopslarge}}}" style="fill:none;stroke:#000000;stroke-width:{{{nlinewidth}}}px;stroke-linecap:butt;stroke-linejoin:miter;stroke-opacity:1;marker-mid:url(#StopL);" />',
        dot: '<circle cx="{{{zerox}}}" cy="30" r="10" stroke="black" stroke-width="2" fill="{{{dotcolor}}}"/>'
    }
    
    
    
    Psnlpoint = function(options){
        if (!options.name){
            return false;
        }
        this.options = jQuery.extend({
            value: 0,
            color: "red",
            shape: "o",
            size: 5,
            type: "fixed"
        }, options);
        this.name = this.options.name;
        this.val = this.options.value;
        return this;
    }
    
    Psnlpoint.prototype.value = function(value){
        if (typeof(value) === 'undefined'){
            return this.val;
        } else {
            this.val = value;
            return this;
        }
    }
    
    Psnlpoint.prototype.attr = function(key, value){
        if (typeof(value) === 'undefined'){
            return this.options[key];
        } else {
            this.options[key] = value;
            return this;
        }
    }
    
    Psnlpoint.prototype.move = function(xpos){
        testilogit.svg = this.svg;
        this.val = this.options.value = xpos;
        var ypos = this.svg.transform.baseVal.getItem(0).matrix.f;
        this.svg.transform.baseVal.getItem(0).setTranslate(xpos, ypos);
        return this;
    }

})(jQuery)

