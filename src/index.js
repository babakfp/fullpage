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
		
		// TODO: Validate
		this.all_slides = this.slider.querySelectorAll('fp-slide')
		this.throw_error_if_el_could_not_be_found(this.all_slides, 'fp-slide')

		this.slide_len = this.all_slides.length
		this.active_slide_index = 0
		this.prev_wheel_deltaY = Math.floor(window.scrollY)

		// 

		window.addEventListener('wheel', e => {
			if (e.deltaY > 0) {
				this.scroll_to_next_slide()
			} else {
				this.scroll_to_prev_slide()
			}
			this.slider.style.transform = `translateY(-${this.all_slides[this.active_slide_index].offsetTop}px)`
		})
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

	/**
	 * @parem el {Node|NodeList} QuerySelector
	 * @parem el_name {String}
	 */
	throw_error_if_el_could_not_be_found(el, el_name) {
		if ( el === null || el.length <= 0 ) {
			throw(
				Error(`The referenced ${el_name} element could not be found.`)
			)
		}
	}

	// 

	scroll_to_next_slide() {
		if (this.active_slide_index < this.slide_len - 1) {
			this.active_slide_index += 1
		}
		console.log(this.active_slide_index);
	}

	scroll_to_prev_slide() {
		if (this.active_slide_index > 0) {
			this.active_slide_index -= 1
		}
		console.log(this.active_slide_index);
	}

}

const mySlider = new FPS(
	'my-slider',
	{
		some_option: 'value'
	}
)
