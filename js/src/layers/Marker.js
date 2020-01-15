// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.

const widgets = require('@jupyter-widgets/base');
const L = require('../leaflet.js');
const layer = require('./Layer.js');

const DEFAULT_LOCATION = [0.0, 0.0];

export class LeafletMarkerModel extends layer.LeafletUILayerModel {
  defaults() {
    return {
      ...super.defaults(),
      _view_name: 'LeafletMarkerView',
      _model_name: 'LeafletMarkerModel',
      location: DEFAULT_LOCATION,
      opacity: 1.0,
      visible: true,
      z_index_offset: 0,
      draggable: true,
      keyboard: true,
      title: '',
      alt: '',
      rise_on_hover: false,
      rise_offset: 250,
      rotation_angle: 0,
      rotation_origin: '',
      icon: null
    };
  }
}

LeafletMarkerModel.serializers = {
  ...layer.LeafletUILayerModel.serializers,
  icon: { deserialize: widgets.unpack_models }
};

export class LeafletMarkerView extends layer.LeafletUILayerView {
  initialize() {
    // Public constructor
    super.initialize.apply(this, arguments);
    this.icon_promise = Promise.resolve();
  }

  create_obj() {
    var that = this;
    this.obj = L.marker(this.model.get('location'), this.get_options());

    this.obj.on('dragend', function(event) {
      var marker = event.target;
      var position = marker.getLatLng();
      that.model.set('location', [position.lat, position.lng]);
      that.touch();
    });
  }

  remove() {
    super.remove();
    var that = this;
    this.icon_promise.then(function() {
      if (that.icon) {
        that.icon.remove();
      }
    });
  }

  set_icon(value) {
    if (this.icon) {
      this.icon.remove();
    }
    if (value) {
      var that = this;
      this.icon_promise = this.icon_promise.then(function() {
        return that.create_child_view(value).then(function(view) {
          that.obj.setIcon(view.obj);
          that.icon = view;
        });
      });
    }
  }

  model_events() {
    super.model_events();
    this.listenTo(
      this.model,
      'change:location',
      function() {
        this.obj.setLatLng(this.model.get('location'));
        this.send({
          event: 'move',
          location: this.model.get('location')
        });
      },
      this
    );
    this.listenTo(
      this.model,
      'change:z_index_offset',
      function() {
        this.obj.setZIndexOffset(this.model.get('z_index_offset'));
      },
      this
    );
    this.listenTo(
      this.model,
      'change:opacity',
      function() {
        if (this.model.get('visible')) {
          this.obj.setOpacity(this.model.get('opacity'));
        }
      },
      this
    );
    this.listenTo(
      this.model,
      'change:visible',
      function() {
        if (this.model.get('visible')) {
          this.obj.setOpacity(this.model.get('opacity'));
        } else {
          this.obj.setOpacity(0);
        }
      },
      this
    );
    this.listenTo(
      this.model,
      'change:rotation_angle',
      function() {
        this.obj.setRotationAngle(this.model.get('rotation_angle'));
      },
      this
    );
    this.listenTo(
      this.model,
      'change:rotation_origin',
      function() {
        this.obj.setRotationOrigin(this.model.get('rotation_origin'));
      },
      this
    );

    this.obj.setLatLng(this.model.get('location'));
    this.obj.setZIndexOffset(this.model.get('z_index_offset'));
    if (this.model.get('visible')) {
      this.obj.setOpacity(this.model.get('opacity'));
    } else {
      this.obj.setOpacity(0);
    }
    this.obj.setRotationAngle(this.model.get('rotation_angle'));
    this.obj.setRotationOrigin(this.model.get('rotation_origin'));
    this.listenTo(
      this.model,
      'change:icon',
      function() {
        this.set_icon(this.model.get('icon'));
      },
      this
    );
    this.set_icon(this.model.get('icon'));
  }
}
