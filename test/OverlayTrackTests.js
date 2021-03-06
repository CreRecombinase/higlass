/* eslint-env node, jasmine */

// Utils
// import {
//   getTrackObjectFromHGC,
//   waitForTilesLoaded
// } from '../app/scripts/utils';

import createElementAndApi from './utils/create-element-and-api';
import removeDiv from './utils/remove-div';

import overlayAnnotations1d2dViewConf from './view-configs/overlay-annotations-1d-2d';
import overlayChromGridViewConf from './view-configs/overlay-chrom-grid';

describe('Overlay Track:', () => {
  let hgc = null;
  let api = null;
  let div = null;
  let viewConf;

  describe('Annotation overlays:', () => {
    it('Should render', (done) => {
      viewConf = overlayAnnotations1d2dViewConf;

      [div, api] = createElementAndApi(viewConf, { bound: true });

      hgc = api.getComponent();

      const numNormalTracks = viewConf.views[0].tracks.top.length
        + viewConf.views[0].tracks.right.length
        + viewConf.views[0].tracks.bottom.length
        + viewConf.views[0].tracks.left.length
        + viewConf.views[0].tracks.center.length;

      expect(numNormalTracks).toEqual(4);

      const trackRenderer = hgc.tiledPlots[viewConf.views[0].uid]
        .trackRenderer;

      const posTracks = trackRenderer.props.positionedTracks;

      expect(posTracks.length).toEqual(5);

      const overlayTrack = posTracks[posTracks.length - 1];

      expect(overlayTrack.track.type).toEqual('overlay-track');

      const overlayTrackInfo = trackRenderer
        .trackDefObjects[overlayTrack.track.uid];

      const overlayTrackDef = overlayTrackInfo.trackDef;
      const overlayTrackObj = overlayTrackInfo.trackObject;

      expect(overlayTrack.height).toBeGreaterThan(0);

      expect(overlayTrackDef.width).toEqual(overlayTrackObj.dimensions[0]);
      expect(overlayTrackDef.height).toEqual(overlayTrackObj.dimensions[1]);

      done();
    });

    afterEach(() => {
      if (api && api.destroy) api.destroy();
      if (div) removeDiv(div);
      api = undefined;
      div = undefined;
    });
  });

  describe('Chromosome grid overlay:', () => {
    it('Should render', (done) => {
      viewConf = overlayChromGridViewConf;

      [div, api] = createElementAndApi(viewConf, { bound: true });

      hgc = api.getComponent();

      const trackRenderer = hgc.tiledPlots[viewConf.views[0].uid]
        .trackRenderer;

      const overlayTrackInfo = trackRenderer
        .trackDefObjects[viewConf.views[0].overlays[0].uid];

      const overlayTrackObj = overlayTrackInfo.trackObject;

      expect(overlayTrackObj.constructor.name).toEqual('ChromosomeGrid');

      hgc.pubSub.subscribe('requestReceived', (url) => {
        if (url === '//s3.amazonaws.com/pkerp/data/hg19/chromSizes.tsv') {
          expect(!!overlayTrackObj.lineGraphics).toBe(true);
          expect(!!overlayTrackObj.lineGraphics1dH).toBe(true);
          expect(!!overlayTrackObj.lineGraphics1dV).toBe(true);
          expect(!!overlayTrackObj.lineGraphics2d).toBe(true);

          done();
        }
      });
    });

    afterEach(() => {
      if (api && api.destroy) api.destroy();
      if (div) removeDiv(div);
      api = undefined;
      div = undefined;
    });
  });
});
