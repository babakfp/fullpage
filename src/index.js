/**
 * Full Page Scroll
 * @param _slider {String} ID of fp-slider
 * @param _options {Object}
 */
class FPS
{
	constructor(_slider='', _options={})
	{
    this.slider = _slider
    this.options = _options
		this.some_option = this.options.some_option || 'default'

		this.throw_error_if_slider_arg_was_not_valid()
		this.slider = document.querySelector(`fp-slider#${this.slider}`)
		this.throw_error_if_slider_el_did_not_exist()
  }

	throw_error_if_slider_arg_was_not_valid() {
		if ( this.slider === undefined || this.slider === null || this.slider === '' ) {
			throw(
				Error('The first argument(slider) of the FPS class is not valid.')
			)
		}
		if ( typeof this.slider !== 'string' ) {
			throw(
				Error('The first argument(slider) of the FPS class needs to be a type of string.')
			)
		}
	}

	throw_error_if_slider_el_did_not_exist() {
		if ( this.slider === null ) {
			throw(
				Error('The referenced fp-slider element could not be found.')
			)
		}
	}

}

const mySlider = new FPS(
	'my-slider',
	{
		some_option: 'value'
	}
)
