(function($) {
    $.cezetmap = function(element, options) {

        var defaults = {
            width:              "370",                  // sirka mapy
            cezetmapClass:      "cezetmap",             // zakladni trida pro stylovani
            regionAreaClass:    "regions",              // trida pro kraje
            regionItemClass:    "region",               // trida pro kraj
            regionHoverClass:   "region-hover",         // trida pro hover nad krajem
            regionActiveClass:  "region-active",        // trida pro aktivni kraj
            regionClickable:    true,                   // muze se na kraj klikat?
            cityAreaClass:      "cities",               // trida pro mesta
            cityItemClass:      "city",                 // trida pro mesto
            cityEnvClass:       "city-env",             // trida pro obaleni mesta (pomocna trida)
            cityHoverClass:     "city-hover",           // trida pro hover nad mestem
            cityActiveClass:    "city-active",          // trida pro aktivni mesto
            cityClickable:      true,                   // muze se na mesto klikat?
            cities:             [],                     // jake mesta zobrazit? ([] | ["all"] | ["ostrava", "praha", ...])
            markerWrapperClass: "markers",              // obalujici trida pro markery
            markerSelector:     false                   // trida pro markery
        };

        var mapPositions = {
            top: 51.0557188,
            bottom: 48.5517785,
            left: 12.0884173,
            right: 18.8570223
        };

        mapPositions.horizontal = 100 / (mapPositions.right - mapPositions.left);
        mapPositions.vertical = 100 / (mapPositions.bottom - mapPositions.top);

        var plugin = this;
        plugin.settings = {};

        var $element = $(element);
        var element = element;

        plugin.init = function() {

            plugin.settings = $.extend({}, defaults, options);
            opt = plugin.settings;

            // rozmery mapy
            var size = parseInt(opt.width);
            var cezetmapHeight = parseInt((size / 1.734));

            // ID aktualniho a predchoziho kraje
            var regionID = -1;
            var regionOld = -1;

            // ==========================
            // CEZET Map element
            // ==========================
            var $cezetmapObj = $("<div></div>").attr({ "class": opt.cezetmapClass });
                $cezetmapObj.css({
                    "width":  size + "px",                    
                    "height": cezetmapHeight + "px"
                });

            var cezetmapSelector = "." + opt.cezetmapClass;

            // ==========================
            // CEZET Map kraje
            // ==========================
            var $regionAreaObj = $("<ul></ul>").attr({ "class": opt.regionAreaClass });
                $regionAreaObj.css({
                    "font-size": size + "px"
                });

            var regionAreaSelector = "." + opt.cezetmapClass + " ." + opt.regionAreaClass;
            var regionItemSelector = "." + opt.cezetmapClass + " ." + opt.regionItemClass;            

            // --------------------------
            // vytvareni kraju
            // --------------------------
            for( var i=0; i<cezetmapRegion.length; i++ ){
                var $this = cezetmapRegion[i];
                var $item = $("<li></li>").attr({ "class": opt.regionItemClass +" "+ $this.class });

                var $link = $("<a></a>").attr({ "href": $this.url, "title": $this.name }).text( $this.name );
                $link.appendTo( $item );

                $item.appendTo( $regionAreaObj );
            }

            $regionAreaObj.appendTo( $cezetmapObj );

            // ==========================
            // CEZET Map mesta
            // ==========================
            var cityAreaSelector = "." + opt.cezetmapClass + " ." + opt.cityAreaClass;
            var cityItemSelector = "." + opt.cezetmapClass + " ." + opt.cityItemClass;

            // --------------------------
            // vytvareni mest
            // --------------------------
            if( $.isArray(opt.cities) && opt.cities.length > 0 && opt.cities != undefined ){
                
                var $cityAreaObj = $("<ul></ul>").attr({ "class": opt.cityAreaClass });

                // vypisovani vsech mest
                if( opt.cities[0] == "all" ){
                    for( var i=0; i<cezetmapCity.length; i++ ){
                        var $this = cezetmapCity[i];

                        var $item = $("<li></li>");
                            $item.attr({"class": opt.cityItemClass +" "+ $this.class});
                            $item.css({"left": $this.pos[0].toFixed(2) + "%", "top": $this.pos[1].toFixed(2) + "%"});

                        var $link = $("<a></a>");
                            $link.attr({ "href": $this.url, "title": $this.name });
                            $link.text( $this.name );
                            $link.wrapInner("<span class='" + opt.cityEnvClass + "'></span>");
                        
                        $link.appendTo( $item );
                        $item.appendTo( $cityAreaObj );
                    }
                }

                // vypisovani vybranych mest
                else{
                    for( var i=0; i<cezetmapCity.length; i++ ){
                        var $this = cezetmapCity[i];

                        for( var j=0; j<opt.cities.length; j++ ){
                            if( $this.class == opt.cities[j] ){

                                var $item = $("<li></li>");
                                    $item.attr({"class": opt.cityItemClass +" "+ $this.class});
                                    $item.css({"left": $this.pos[0].toFixed(2) + "%", "top": $this.pos[1].toFixed(2) + "%"});

                                var linkPointerClass = "";
                                if( opt.cityClickable == false ){
                                    linkPointerClass = "noPointer";
                                }

                                var $link = $("<a></a>");
                                    $link.attr({ "href": $this.url, "title": $this.name, "class": linkPointerClass });
                                    $link.text( $this.name );
                                    $link.wrapInner("<span class='" + opt.cityEnvClass + "'></span>");
                        
                                $link.appendTo( $item );
                                $item.appendTo( $cityAreaObj ); 
                            }
                        }
                    }
                }

                $cityAreaObj.appendTo( $cezetmapObj );
            }

            function centerMarker($marker, lat, lng) {
                var left = 100 - (mapPositions.horizontal * (mapPositions.right - lng));
                var top = 100 - (mapPositions.vertical * (mapPositions.bottom - lat));
                $marker.css({
                    left: left + "%",
                    top: top + "%"
                });
            }

            if(opt.markerSelector){
                var $marker;
                var defaultMarkerCss = {
                    position: "absolute"
                };
                $(opt.markerSelector).css(defaultMarkerCss);

                var $markers = $element.find(opt.markerSelector);
                $markers.appendTo($cezetmapObj);
                $markers.wrapAll("<div class='"+opt.markerWrapperClass+"'></div>");

                $($markers).each(function () {
                    var lat = false, lng = false, data, position;
                    $marker = $(this);
                    data = $marker.data();
                    if(data.position){
                        position = data.position.split(",");
                        lat = position[0];
                        lng = position[1];
                    }
                    if(data.lng){
                        lng = data.lng;
                    }
                    if(data.lat){
                        lat = data.lat;
                    }
                    if(!lat || !lng){
                        console.error("Marker position data not found.");
                    }
                    else{
                        centerMarker($marker, lat, lng);
                    }
                });
            }

            // ==========================
            // vytvareni mapy
            // ==========================
            $cezetmapObj.appendTo( $element );

            // ==========================
            // udalosti nad celou mapou
            // ==========================
            $cezetmapObj.on("mousemove", function(e){
                var parentOffset = $(this).offset();

                // zjisteni absolutnich souradnic
                var absX = e.pageX - parentOffset.left;
                var absY = e.pageY - parentOffset.top;  

                // zjisteni procentualnich souradnic
                var perX = (absX / size) * 100;
                var perY = (absY / cezetmapHeight) * 100;

                var regionID = 0;

                for( var i=0; i<cezetmapRegion.length; i++ ){
                    // zjisteni zda souradnice mysi lezi uvnitr souradnic kraje
                    if(isPointInPoly(cezetmapRegion[i].pos, {x: perX, y: perY})){
                        regionID = i;

                        // zobrazeni ruky jen kdyz je povoleno na kraje klikat
                        if( opt.regionClickable ){
                            $(cezetmapSelector).css("cursor", "pointer");
                        }

                        if( regionID != regionOld ){

                            // pridani tridy pro hover nad krajem
                            $(regionItemSelector).removeClass( opt.regionHoverClass );
                            $(regionItemSelector).eq(regionID).addClass( opt.regionHoverClass );

                            regionOld = regionID;
                        }

                        break;
                    }
                }
            });

            // --------------------------
            // opusteni mapy
            // --------------------------
            $cezetmapObj.on("mouseleave", function(e){
                regionOld = -1;
                $(regionItemSelector).removeClass(opt.regionHoverClass);
            });

            // --------------------------
            // kliknuti na kraj
            // --------------------------
            $cezetmapObj.on("click", function(e){
                var parentOffset = $(this).offset();

                // zjisteni absolutnich souradnic
                var absX = e.pageX - parentOffset.left;
                var absY = e.pageY - parentOffset.top;  

                // zjisteni procentualnich souradnic
                var perX = (absX / size) * 100;
                var perY = (absY / cezetmapHeight) * 100;

                var regionID = 0;

                for( var i=0; i<cezetmapRegion.length; i++ ){
                    if(isPointInPoly(cezetmapRegion[i].pos, {x: perX, y: perY})){
                        regionID = i;
                        break; 
                    }
                }

                // vybrany kraj
                var regionSelected = $(regionItemSelector).eq(regionID);
                var regionLink = $(regionSelected).find("a").attr("href");

                // pridani tridy pro aktualni kraj
                $(regionItemSelector).removeClass( opt.regionActiveClass );
                regionSelected.addClass( opt.regionActiveClass );

                // otevreni
                if( regionLink != undefined && opt.regionClickable ){
                    location.href = regionLink;
                }

                return false;
            });

            // --------------------------
            // hover nad mestem
            // --------------------------
            $(cityItemSelector).hover(
                function(){
                    $(cityItemSelector).removeClass( opt.cityHoverClass );
                    $(this).addClass( opt.cityHoverClass );
                },
                function(){
                    $(cityItemSelector).removeClass( opt.cityHoverClass );
                }
            );

            // --------------------------
            // kliknuti na mesto
            // --------------------------
             $(cityItemSelector).click(function(){
                var $this = $(this);
                var cityLink = $this.find("a").attr("href");
                
                $(cityItemSelector).removeClass( opt.cityActiveClass );
                $this.closest( opt.cityItemClass ).addClass( opt.cityActiveClass );
                
                if( cityLink != undefined && opt.cityClickable ){
                    location.href = cityLink;
                }

                return false;
            });
        }

        // --------------------------
        // public methods
        // these methods can be called like:
        // plugin.methodName(arg1, arg2, ... argn) from inside the plugin or
        // element.data('cezetmap').publicMethod(arg1, arg2, ... argn) from outside 
        // the plugin, where "element" is the element the plugin is attached to;
        // --------------------------        

        plugin.foo_function = function() {}

        // --------------------------
        // private methods
        // these methods can be called only from inside the plugin like:
        // methodName(arg1, arg2, ... argn)
        // --------------------------

        //Jonas Raoni Soares Silva
        //http://jsfromhell.com/math/is-point-in-poly [v1.0]

        var isPointInPoly = function(poly, pt){
            for(var c = false, i = -1, l = poly.length, j = l - 1; ++i < l; j = i)
                ((poly[i].y <= pt.y && pt.y < poly[j].y) || (poly[j].y <= pt.y && pt.y < poly[i].y))
                && (pt.x < (poly[j].x - poly[i].x) * (pt.y - poly[i].y) / (poly[j].y - poly[i].y) + poly[i].x)
                && (c = !c);
            return c;
        }

        plugin.init();
    }

    // add the plugin to the jQuery.fn object
    $.fn.cezetmap = function(options) {        
        return this.each(function() {
            if (undefined == $(this).data('cezetmap')) {
                var plugin = new $.cezetmap(this, options);
                $(this).data('cezetmap', plugin);
            }
        });
    }

})(jQuery);