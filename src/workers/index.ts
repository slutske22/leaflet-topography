import worker4elevation from './elevation.blob';
import worker4slope from './slope.blob';
import worker4aspect from './aspect.blob';
import worker4slopeaspect from './slopeaspect.blob';

const workers = {
	elevation: worker4elevation,
	slope: worker4slope,
	aspect: worker4aspect,
	slopeaspect: worker4slopeaspect,
};

export default workers;
