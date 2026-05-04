import ko from 'knockout';
import L from 'leaflet';

import '~/lib/controls-styles/controls-styles.css';
import '~/lib/leaflet.control.commons';
import '~/lib/leaflet.hashState/leaflet.hashState';

import './control.css';

L.Control.Filters = L.Control.extend({
    options: {
        position: 'bottomright',
    },

    includes: [L.Mixin.Events, L.Mixin.HashState],

    stateChangeEvents: ['change'],

    initialize: function (tracklist, options) {
        L.Control.prototype.initialize.call(this, options);
        this._tracklist = tracklist;
        this.nameFilter = ko.observable('');
        this.nameFilter.subscribe(() => {
            this._applyFilters();
            this.fire('change');
        });
    },

    onAdd: function (map) {
        this._map = map;
        const container = L.DomUtil.create('div', 'leaflet-control control-form control-filters');
        this._container = container;
        this._stopContainerEvents();

        /* eslint-disable max-len */
        container.innerHTML = `
            <div class="leaflet-control-button-toggle icon-filters"
                 data-bind="click: setExpanded"
                 title="Filters"></div>
            <div class="leaflet-control-content">
                <div class="header">
                    <div title="Filters">Filters</div>
                    <div class="button-minimize" data-bind="click: setMinimized"></div>
                </div>
                <table class="layout">
                    <tbody>
                        <tr>
                            <td class="label">Name</td>
                            <td>
                                <input type="text" class="filter-input"
                                       placeholder="contains..."
                                       data-bind="textInput: nameFilter">
                            </td>
                        </tr>
                        <tr>
                            <td colspan="2" class="button-row">
                                <a class="text-button button-reset"
                                   data-bind="click: resetFilters">Reset filters</a>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        `;
        /* eslint-enable max-len */

        ko.applyBindings(this, container);

        if (this._tracklist) {
            this._onTracksChanged = this._onTracksChanged.bind(this);
            this._tracklist.on('trackschanged', this._onTracksChanged);
        }
        return container;
    },

    onRemove: function () {
        if (this._tracklist && this._onTracksChanged) {
            this._tracklist.off('trackschanged', this._onTracksChanged);
        }
    },

    setExpanded: function () {
        L.DomUtil.removeClass(this._container, 'minimized');
    },

    setMinimized: function () {
        L.DomUtil.addClass(this._container, 'minimized');
    },

    _onTracksChanged: function () {
        this._applyFilters();
    },

    _applyFilters: function () {
        if (!this._tracklist || this._applyingFilters) {
            return;
        }
        this._applyingFilters = true;
        try {
            const nameFilter = (this.nameFilter() || '').trim().toLowerCase();
            this._tracklist.tracks().forEach((track) => {
                const trackName = (track.name() || '').toLowerCase();
                const matches = !nameFilter || trackName.includes(nameFilter);
                if (track.visible() !== matches) {
                    track.visible(matches);
                }
            });
        } finally {
            this._applyingFilters = false;
        }
    },

    resetFilters: function () {
        this.nameFilter('');
    },

    serializeState: function () {
        const value = (this.nameFilter() || '').trim();
        if (!value) {
            return null;
        }
        return [encodeURIComponent(value)];
    },

    unserializeState: function (state) {
        if (!state || !state.length) {
            this.nameFilter('');
            return true;
        }
        try {
            this.nameFilter(decodeURIComponent(state[0]));
        } catch (e) {
            return false;
        }
        return true;
    },
});
