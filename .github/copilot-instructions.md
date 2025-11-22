# Nakarte Development Guide

## Project Overview

Nakarte is a web-based mapping application for outdoor navigation and track management. Built with Leaflet.js and Knockout.js, it emphasizes custom Leaflet extensions and a plugin-based architecture.

## Architecture

### Leaflet Extension Pattern

The codebase extends Leaflet via **mixins and classical extension**:

```javascript
// Classical extension
L.Control.TrackList = L.Control.extend({
    includes: L.Mixin.Events,
    initialize: function(options) {
        L.Control.prototype.initialize.call(this, options);
        // ...
    }
});

// Mixin pattern for reusable behavior
L.Polyline.EditMixin = {
    startEdit: function() { /* ... */ },
    stopEdit: function() { /* ... */ }
};
TrackSegment.mergeOptions(L.Polyline.EditMixinOptions);
```

**Never use ES6 classes** for Leaflet extensions—use `L.*.extend()` and mixins.

### Module Organization

- **`src/lib/`**: Self-contained feature modules following naming convention `leaflet.control.*`, `leaflet.layer.*`, etc.
- Each module is a directory with an `index.js` entry point
- Related utilities organized in subdirectories (e.g., `lib/leaflet.control.track-list/lib/parsers/`)

### State Management

Two distinct state systems:

1. **URL Hash State** (`src/lib/leaflet.hashState/`): Synchronizes component state with URL hash for shareability
   - Implement `L.Mixin.HashState` on components
   - Define `serializeState()`, `unserializeState()`, `validateState()`, and `stateChangeEvents`
   - Example: Map position stored as `#m=9/44.50/20.31`

2. **Knockout Observables**: Used for UI reactivity in controls
   ```javascript
   this.tracks = ko.observableArray();
   track.visible = ko.observable(true);
   track.visible.subscribe(this.onTrackVisibilityChanged.bind(this, track));
   ```

### Import Path Resolution

Use `~/` alias for all imports from `src/`:
```javascript
import config from '~/config';
import {notify} from '~/lib/notifications';
```

Configured in `webpack/webpack.config.js` via `resolve.alias: {'~': paths.appSrc}`.

## Development Workflow

### Commands

```bash
yarn start          # Dev server at localhost:8080
yarn run lint       # ESLint + stylelint (must pass before commit)
yarn test           # Run Karma tests in ChromeHeadless
yarn build          # Production build to build/
```

### Pre-commit Requirements

1. **All changes must relate to a single GitHub issue** (referenced as `#123` in first line of commit message)
2. **Run linter** on modified code—no new warnings allowed
3. **Test in multiple scenarios** (not just happy path)
4. **Squash commits** to one (or minimal logical units) before PR
5. **Rebase on master** before merge

See `CONTRIBUTING.md` for full workflow (written in Russian).

### Secrets Configuration

Copy `src/secrets.js.template` to `src/secrets.js` for local development. Contains API keys for:
- Google Maps API
- Sentry error tracking
- Other external services

Keys in repository are dummy values. Production keys are managed separately.

## Key Patterns

### Track Data Flow

Tracks are parsed/exported via modular format handlers:
- **Import**: `parseGeoFile()` → array of geodata objects with `{name, tracks, points, error}`
- **Export**: `geoExporters.saveGpx()`, `.saveKml()`, etc. take segments and waypoints

Internal format uses:
```javascript
{
    name: string,
    tracks: [[[lat, lng], ...]], // array of line segments
    points: [{lat, lng, name}, ...],
    color: number,
    trackHidden: boolean
}
```

### Layer Configuration

Layers defined in `src/layers.js` as declarative objects with options:
```javascript
{
    title: 'Layer Name',
    isDefault: true,  // included in default layer selection
    layer: L.tileLayer('...', {
        code: 'O',     // keyboard hotkey
        shortName: 'osm',
        print: true,   // include in print functionality
        jnx: true      // exportable to JNX format
    })
}
```

### Event-Driven UI Updates

Components fire custom events for cross-component communication:
```javascript
this.fire('trackschanged');
tracklist.on('startedit', this.onTrackEditStart, this);
```

Use `L.Mixin.Events` for event capabilities.

## Testing

- **Framework**: Karma + Mocha + Chai
- **Config**: `test/karma.conf.js`
- Tests use `babel-plugin-rewire` for mocking internal functions
- Tests named `test/test_*.js` and auto-discovered

Example test structure:
```javascript
suite('Track loading', function() {
    test('loads GPX files', function() {
        // assertions
    });
});
```

## ESLint Configuration

Custom modular ESLint setup in `eslint_rules/`:
- `base.js`: Core rules (extended from `eslint:recommended`)
- `imports_*.js`: Import resolution rules for different contexts
- `relax_*.js`: Relaxed rules for legacy/vendored code

Specific files can have relaxed rules (see `legacy_files_list.js`).

## Common Gotchas

1. **Leaflet coordinates cross 180° meridian**: Use helper functions from `~/lib/leaflet.fixes/fixWorldCopyJump` like `wrapLatLngToTarget()`, `wrapLatLngBoundsToTarget()`

2. **Hash state synchronization**: When implementing hash state, always validate input in `validateState()` and return `{valid: false}` on invalid data to prevent hash corruption

3. **Polyline editing**: Use `TrackSegment` (which includes `L.Polyline.EditMixin`) instead of raw `L.Polyline` for editable track segments

4. **File encoding**: All geodata must be UTF-8 encoded (use `utf8.encode()` from `utf8` package before embedding in XML/text formats)

5. **Async operations**: Most geo file operations are async—use promises/async-await consistently
