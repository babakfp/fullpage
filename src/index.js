/**
 * FullPage
 * @param _slider_node {HTMLElement} Main element
 * @param _options {Object}
 */
class Fullpage
{
	constructor(_slider_node, _options={})
	{
		this.slider_node = _slider_node
		this.options = _options

    // Validating the arguments
		this.validate_constructor__slider_node()
		this.validate_constructor__options()

		// Setting the default options
		this.options.is_horizontal = this.options.is_horizontal ?? false
		this.options.dots_use_link = this.options.dots_use_link ?? false
		this.options.allow_free_movement = this.options.allow_free_movement ?? false

    if (this.options.is_horizontal) {
      this.slider_node.classList.add('fullpage--horizontal')
    }

		// TODO: Validate
		this.slide_nodes = this.slider_node.querySelectorAll('.fullpage-slide')
		this.throw_error_if_el_could_not_be_found(this.slide_nodes, '.fullpage-slide')

		this.active_slide_index = 0

    let all_percentages = []
    this.slide_nodes.forEach(element => {
      all_percentages.push(this.getViewPercentage(element))
    })
    const all_percentages_highest_value = Math.max(...all_percentages)
    this.active_slide_index = all_percentages.indexOf(all_percentages_highest_value)
    console.log(all_percentages);
    console.log(this.active_slide_index);
    this.set_slide_translate()

		// -------------------------------------------
		
		this.dots_nav_node
		this.create_dots()
		this.dot_nav_item_nodes = this.slider_node.querySelectorAll('.fullpage-dot')
    this.dot_nav_item_nodes[this.active_slide_index].classList.add('active')

		this.dot_nav_item_nodes.forEach((dot, i) => {

			dot.querySelector('.fullpage-dot-action').addEventListener('click', _=> {
        if (this.options.allow_free_movement === true) {
          this.navDotOnClick(dot, i)
        } else if (this.allow_dot_click) {
          this.allow_dot_click = false

          this.navDotOnClick(dot, i)
      
          setTimeout(_=> {
            this.allow_dot_click = true
          }, this.get_scroll_speed_for_allow_scroll())
        }
			})

		})

		this.allow_wheel_scroll = true
		this.allow_dot_click = true

		// ------------------------------

		this.on_scroll()

    // Fix position when height resize
    const copy_of_original_scroll_speed = this.get_css_var('--fullpage-scroll-speed')
    window.addEventListener('resize', _=> {
      this.set_css_var('--fullpage-scroll-speed', '0ms')
      this.set_slide_translate()
      setTimeout(_=> {
        this.set_css_var('--fullpage-scroll-speed', copy_of_original_scroll_speed)
      }, 150)
    })
  }

  on_scroll() {
		this.slider_node.addEventListener('wheel', e => {

			if (this.options.allow_free_movement === true) {

				this.do_scroll_stuff(e)
			
			} else if (this.allow_wheel_scroll) {

				this.allow_wheel_scroll = false
				this.do_scroll_stuff(e)
	
				setTimeout(_=> {
					this.allow_wheel_scroll = true
				}, this.get_scroll_speed_for_allow_scroll())

			}

    })
	}

  navDotOnClick(dot, i) {
    this.dot_nav_item_nodes.forEach(dot2 => dot2.classList.remove('active'))
    dot.classList.add('active')
    this.active_slide_index = i
    this.set_slide_translate()
  }

  getViewPercentage(element) {
    const viewport = {
      top: window.pageYOffset,
      bottom: window.pageYOffset + window.innerHeight
    };
  
    const elementBoundingRect = element.getBoundingClientRect();
    const elementPos = {
      top: elementBoundingRect.y + window.pageYOffset,
      bottom: elementBoundingRect.y + elementBoundingRect.height + window.pageYOffset
    };
  
    if (viewport.top > elementPos.bottom || viewport.bottom < elementPos.top) {
      return 0;
    }
  
    // Element is fully within viewport
    if (viewport.top < elementPos.top && viewport.bottom > elementPos.bottom) {
      return 100;
    }
  
    // Element is bigger than the viewport
    if (elementPos.top < viewport.top && elementPos.bottom > viewport.bottom) {
      return 100;
    }
  
    const elementHeight = elementBoundingRect.height;
    let elementHeightInView = elementHeight;
  
    if (elementPos.top < viewport.top) {
      elementHeightInView = elementHeight - (window.pageYOffset - elementPos.top);
    }
  
    if (elementPos.bottom > viewport.bottom) {
      elementHeightInView = elementHeightInView - (elementPos.bottom - viewport.bottom);
    }
  
    const percentageInView = (elementHeightInView / window.innerHeight) * 100;
  
    return Math.round(percentageInView);
  }

	// Gets the values based on is the element in the viewport
	rect_values (el) {
    const rect = el.getBoundingClientRect()

    return {
			top: Math.floor(rect.top),
			right: Math.floor(rect.right),
			bottom: Math.floor(rect.bottom),
			left: Math.floor(rect.left),
    }
	}

	do_scroll_stuff(e) {
		if (this.options.is_horizontal ? e.deltaX > 0 : e.deltaY > 0) {
			this.scroll_to_next_slide()
		} else {
			this.scroll_to_prev_slide()
		}
		this.set_slide_translate()
	}

	set_slide_translate() {
    if (this.options.is_horizontal) {
  		this.set_css_var('--fullpage-translateX', `-${this.active_slide_index * window.innerWidth}px`)
    } else {
      this.set_css_var('--fullpage-translateY', `-${this.active_slide_index * window.innerHeight}px`)
    }
	}

	get_active_slide_el() {
		return this.slide_nodes[this.active_slide_index]
	}

	/**
	 * We don't want to user be able to do the next scroll after the exact amount of time of the transition duration because then user may try to scroll again, 1 second before the duration actualy ends. So we don't want that bad UX and brokenness.
	 * 10%  | xx?
	 * 100% | 1000ms
	 */
	get_scroll_speed_for_allow_scroll() {
		const speedCssVar = this.get_css_var('--fullpage-scroll-speed')
		const speed = speedCssVar.substring(0, speedCssVar.length - 2)
    return speed * 90 / 100
	}

	update_dots_activeness() {
    this.dot_nav_item_nodes.forEach(dot => dot.classList.remove('active'))
		this.dot_nav_item_nodes[this.active_slide_index].classList.add('active')
	}

	scroll_to_next_slide() {
		if (this.active_slide_index < this.slide_nodes.length - 1) {
			this.active_slide_index += 1

			this.update_dots_activeness()
		}
		// console.log(`ACTIVE_SLIDE: ${this.active_slide_index}`)
	}

	scroll_to_prev_slide() {
		if (this.active_slide_index > 0) {
			this.active_slide_index -= 1

			this.update_dots_activeness()
		}
		// console.log(`ACTIVE_SLIDE: ${this.active_slide_index}`)
	}

	// --------------------------------------------

	create_dots() {

		const nav = document.createElement('nav')
		nav.classList.add('fullpage-dots')
		
		const ul = document.createElement('ul')

		for (let i = 1; i <= this.slide_nodes.length; i++) {

			const li = document.createElement('li')
			li.classList.add('fullpage-dot')

      const tooltip = document.createElement('span')
			tooltip.classList.add('fullpage-dot-tooltip')
      tooltip.innerText = this.slide_nodes[i - 1].getAttribute('data-tooltip')

			if (this.options.dots_use_link) {
	
				const a = document.createElement('a')
				a.classList.add('fullpage-dot-action')
				a.appendChild(tooltip)
				li.appendChild(a)
	
			} else {
	
				const button = document.createElement('button')
				button.classList.add('fullpage-dot-action')
				button.appendChild(tooltip)
				li.appendChild(button)
	
			}
	
			ul.appendChild(li)

		}

		nav.appendChild(ul)

		this.dots_nav_node = nav
		this.slider_node.appendChild(this.dots_nav_node)

	}

	/* CSS Variable Stuff
	-------------------------
	*/

	/**
	 * Set CSS Variable to :root
	 * @param css_var_name {String}
	 * @param css_var_value {String}
	 */
	set_css_var(css_var_name, css_var_value) {
		document.documentElement.style.setProperty(css_var_name, css_var_value)
	}

	/**
	 * Get CSS Variable value
	 * @param css_var_name {String}
	 */
	get_css_var(css_var_name) {
		return getComputedStyle(document.documentElement).getPropertyValue(css_var_name)
	}

	/* Throw Error
	-------------------------
	*/

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

	/**
	 * Gets computed translate values
	 * @param element {HTMLElement}
	 * @returns {Object}
	 */
	get_el_translate_values(element) {
		const style = window.getComputedStyle(element)
		const matrix = style['transform'] || style.webkitTransform || style.mozTransform

		// No transform property. Simply return 0 values.
		if (matrix === 'none' || typeof matrix === 'undefined') {
			return {
				x: 0,
				y: 0,
				z: 0,
			}
		}

		// Can either be 2d or 3d transform
		const matrixType = matrix.includes('3d') ? '3d' : '2d'
		const matrixValues = matrix.match(/matrix.*\((.+)\)/)[1].split(', ')

		// 2d matrices have 6 values
		// Last 2 values are X and Y.
		// 2d matrices does not have Z value.
		if (matrixType === '2d') {
			return {
				x: parseInt(matrixValues[4]),
				y: parseInt(matrixValues[5]),
				z: 0,
			}
		}

		// 3d matrices have 16 values
		// The 13th, 14th, and 15th values are X, Y, and Z
		if (matrixType === '3d') {
			return {
				x: parseInt(matrixValues[12]),
				y: parseInt(matrixValues[13]),
				z: parseInt(matrixValues[14]),
			}
		}
	}

  is_element(obj) {
    try {
      // Using W3 DOM2 (works for FF, Opera and Chrome)
      return obj instanceof HTMLElement
    }
    catch(e){
      // Browsers not supporting W3 DOM2 don't have HTMLElement and
      // an exception is thrown and we end up here. Testing some
      // properties that all elements have (works on IE7)
      return (typeof obj==='object') &&
        (obj.nodeType===1) && (typeof obj.style === 'object') &&
        (typeof obj.ownerDocument ==='object')
    }
  }

  /**
   * ------------------------------------------------------------------------------------
   * Validating the arguments
   * ------------------------------------------------------------------------------------
   */

	validate_constructor__slider_node() {

    const textPrefix = 'The first argument ("slider") in the "Fullpage" class,'

    if ( typeof this.slider_node === 'undefined' ) {
			throw( Error(`${textPrefix} is required.`) )
    }
    else if ( this.slider_node === document || this.slider_node === document.body || this.slider_node === document.head ) {
			throw( Error(`${textPrefix} must be an element inside "document.body".`) )
    }
    else if ( !this.is_element(this.slider_node) ) {
			throw( Error(`${textPrefix} is invalid or is not a type of element, or doesn't exist.`) )
    }
    else if ( !this.slider_node.classList.contains('fullpage') ) {
			throw( Error(`${textPrefix} must contain the "fullpage" calss.`) )
    }

	}

  validate_constructor__options() {

    if ( typeof this.options !== 'object' ) {
			throw( Error(`The second argument ("option") in the "Fullpage" class, must be a type of object.`) )
    }

  }

}
