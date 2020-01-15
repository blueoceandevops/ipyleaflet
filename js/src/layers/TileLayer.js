// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.

const _ = require('underscore');
const L = require('../leaflet.js');
const rasterlayer = require('./RasterLayer.js');
const Spinner = require('spin.js').Spinner;

export class LeafletTileLayerModel extends rasterlayer.LeafletRasterLayerModel {
  defaults() {
    return {
      ...super.defaults(),
      _view_name: 'LeafletTileLayerView',
      _model_name: 'LeafletTileLayerModel',
      bottom: true,
      url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
      min_zoom: 0,
      max_zoom: 18,
      tile_size: 256,
      attribution:
        'Map data (c) <a href="https://openstreetmap.org">OpenStreetMap</a> contributors',
      detect_retina: false,
      tms: false,
      show_loading: false,
      loading: false
    };
  }
}

export class LeafletTileLayerView extends rasterlayer.LeafletRasterLayerView {
  create_obj() {
    this.obj = L.tileLayer(this.model.get('url'), this.get_options());
    this.model.on('msg:custom', _.bind(this.handle_message, this));
  }

  leaflet_events() {
    super.leaflet_events();
    var that = this;
    this.obj.on('loading', function(event) {
      that.model.set('loading', true);
      that.model.save_changes();
      if (that.model.get('show_loading')) {
        that.spinner = new Spinner().spin(that.map_view.el);
      }
    });
    this.obj.on('load', function(event) {
      that.model.set('loading', false);
      that.model.save_changes();
      that.send({
        event: 'load'
      });
      if (that.model.get('show_loading')) {
        that.spinner.stop();
      }
    });
  }

  model_events() {
    super.model_events();
    this.listenTo(
      this.model,
      'change:url',
      function() {
        this.obj.setUrl(this.model.get('url'));
      },
      this
    );
  }

  handle_message(content) {
    if (content.msg == 'redraw') {
      this.obj.redraw();
    }
  }
}
