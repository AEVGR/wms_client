class GrWmsClient {



    /**
    * @param {String} urlWms "wms.geo.gr.ch/naturschutz"
    * @param {module} idImage img_home
    */
    constructor(urlWms, layer, idImage, hoehe = 600, breite = 800, x = 2764000, y = 1166000) {
        this._x = x;
        this._y = y;
        this._layer = layer;
        this._hoehe = hoehe;
        if (breite < 650) {
            this._breite = 650;
        } else {
            this._breite = breite;
        }
        var div = 5.5;
        this._zoomArray = [50 / div, 100 / div, 200 / div, 250 / div, 500 / div, 750 / div, 1000 / div, 2000 / div, 2500 / div, 5000 / div, 7500 / div, 10000 / div, 20000 / div, 25000 / div, 50000 / div, 100000 / div, 200000 / div, 500000 / div, 800000 / div];
        this._zoomPos = this._zoomArray.length - 1;
        this._mDown = false;
        this._dx = 0.1;
        this._dy = 0.1
        this._dtime = 0;

        this._urlWms = urlWms;
        this._idImage = idImage;
        this._img = new Image();
        this._img.draggable = false;
        this._img.src = this._getImgUrl();
        this._img.addEventListener("wheel", this._wheelZoom.bind(this), true);
        this._img.addEventListener("touchstart", this._mouseDown.bind(this));
        this._img.addEventListener("touchend", this._mouseUp.bind(this));
        this._img.addEventListener("mousedown", this._mouseDown.bind(this));
        this._img.addEventListener("mouseup", this._mouseUp.bind(this));



        this._idImage.appendChild(this._img);
        this._idImage.draggable = false;
        this._calback = function clickCalback(x, y) { alert(x.toString().concat(" --- ", y.toString())); };

    }

    /**
    * @param  {function(x,y)} fxy mit x,y als paramter  
    */

    setClickFxy(fxy) {
        this._calback = fxy;
    }



    /**
    * @returns {String} url für den WMS Server 
    */
    _getImgUrl() {
        var _elem = document.getElementById("point");
        if (_elem != null) {
            _elem.parentNode.removeChild(_elem);
        }
        var _x1;
        var _x2;
        var _y1;
        var _y2;
        var _url;
        _x1 = this._x - this._zoomArray[this._zoomPos] / 2;
        _x2 = this._x + this._zoomArray[this._zoomPos] / 2;
        _y1 = this._y - this._zoomArray[this._zoomPos] / 2;
        _y2 = this._y + this._zoomArray[this._zoomPos] / 2;
        _url = "https://".concat(this._urlWms);
        _url = _url.concat("/?SERVICE=WMS&REQUEST=GetMap&VERSION=1.3.0&LAYERS=");
        _url = _url.concat(this._layer);
        _url = _url.concat("&STYLES=default&CRS=EPSG:2056&BBOX=");
        _url = _url.concat(_x1.toString());
        _url = _url.concat(",", _y1.toString());
        _url = _url.concat(",", _x2.toString());
        _url = _url.concat(",", _y2.toString());
        _url = _url.concat("&WIDTH=", this._breite.toString());
        _url = _url.concat("&HEIGHT=", this._hoehe.toString());
        _url = _url.concat("&FORMAT=image/png");
        return _url;
    }

    /**
    * @param  {event} event 
    */
    _wheelZoom(event) {
        var _posx = event.pageX - this._img.offsetLeft - this._breite / 2;
        var _posy = event.pageY - this._img.offsetTop - this._hoehe / 2;
        //     this._x = parseInt(this._x + _posx / this._breite * this._zoomArray[this._zoomPos]);
        //     this._y = parseInt(this._y - _posy / this._hoehe * this._zoomArray[this._zoomPos]);
        this.zoom(event.wheelDelta * -1);
        event.preventDefault();
        event.stopPropagation();
        this._checkIfNotGR();
        return false;
    }
    /**
    * @param  {integer} d_zoom -1 kleiner 1 grösser
    */
    zoom(dzoom) {
        if (dzoom < 0) {
            this._zoomPos = this._zoomPos - 1;
        } else {
            this._zoomPos = this._zoomPos + 1;
        }
        if (this._zoomPos < 0) this._zoomPos = 0;
        if (this._zoomPos > (this._zoomArray.length - 1)) this._zoomPos = this._zoomArray.length - 1;

        this._zoom = this._zoomArray[this._zoomPos];
        this._img.src = this._getImgUrl();
    }
    /**
    * @param  {integer} x posx 2819674
    * @param  {integer} x posx 1176049
    * @param  {integer} x posx 500
    */
    posXY(x, y, massstab) {
        this._x = x;
        this._y = y;
        for (let index = 0; index < this._zoomArray.length; index++) {
            if (massstab > this._zoomArray[index]) {
                this._zoomPos = index;

            } else {
                break;
            }

        }
        this._img.src = this._getImgUrl();

    }

    /**
    * @param  {event} event 
    */

    _mouseDown(event) {
        if (event.type == 'touchstart') {
            var _touch = event.touches[0];
            var _x = _touch.pageX;
            var _y = _touch.pageY;
        } else if (event.type == 'mousedown') {
            var _x = event.pageX;
            var _y = event.pageY;
        }
        if (!this._mDown) {
            this._dx = _x;
            this._dy = _y;
            this._mDown = true;
        }
        this._dtime = Date.now();
        event.preventDefault();
        event.stopPropagation();
        return false;
    }


    /**
    * @param  {event} event 
    */
    _mouseUp(event) {
        if ((Date.now() - this._dtime) < 300) {
            var _posx = event.pageX - this._img.offsetLeft - this._breite / 2;
            var _posy = event.pageY - this._img.offsetTop - this._hoehe / 2;
            var _x = parseInt(this._x + _posx / this._breite * this._zoomArray[this._zoomPos]);
            var _y = parseInt(this._y - _posy / this._hoehe * this._zoomArray[this._zoomPos]);
            var _p = {
                x: event.pageX,
                y: event.pageY
            }
            this._drawAt(_p);
            this._calback(_x, _y);
            //           alert(_x.toString().concat("\n", _y.toString()));

        } else {
            if (event.type == 'touchend') {
                var _touch = event.changedTouches[0];
                var _x = _touch.pageX;
                var _y = _touch.pageY;
            } else if (event.type == 'mouseup') {
                var _x = event.pageX;
                var _y = event.pageY;
            }
            this._dx = this._dx - _x;
            this._dy = this._dy - _y;
            this._x = parseInt(this._x + this._dx / this._breite * this._zoomArray[this._zoomPos]);
            this._y = parseInt(this._y - this._dy / this._hoehe * this._zoomArray[this._zoomPos]);
            this._img.src = this._getImgUrl();
            this._mDown = false;
            let sel = document.getSelection();
            sel.removeAllRanges();
        }
        event.preventDefault();
        event.stopPropagation();

        return false;
    }



    _drawAt(point) {
        var _elem = document.getElementById("point");
        if (_elem != null) {
            _elem.parentNode.removeChild(_elem);
        }
        var dotSize = 10; // in px
        var div = document.createElement('div');
        div.setAttribute("id", "point");
        div.style.backgroundColor = "#0000FF"
        div.style.width = dotSize + "px";
        div.style.height = dotSize + "px"
        div.style.position = "absolute"
        div.style.left = (point.x - dotSize / 2) + "px"
        div.style.top = (point.y - dotSize / 2) + "px"
        div.style.borderRadius = "50%"
        this._idImage.appendChild(div);
    }

    _checkIfNotGR() {
        this._x = (this._x < 2700000) ? 2700000 : this._x;
        this._x = (this._x > 3000000) ? 3000000 : this._x;
        this._y = (this._y < 1000000) ? 1000000 : this._y;
        this._y = (this._y > 1300000) ? 1300000 : this._y;
    }
}
