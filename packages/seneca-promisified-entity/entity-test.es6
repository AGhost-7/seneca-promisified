import patchMake from './entity';
import SenecaPromisified from './index';
import senecaModule from 'seneca';



class MyWrapper extends SenecaPromisified {
	instantiate(seneca) {
		return new MyWrapper(seneca);
	}
}



describe('entity', () => {
	it('save', () => {

	});
});
