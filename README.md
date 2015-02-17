# Perfecting Parallax Scrolling

This is part of a talk I gave at a Icelandic javascript user group meetup.

Slides from the presentation:
http://dev.form5.is/parallax/slides.pdf

The demo code can be found in this repository and following is an article I wrote on the subject which has links to the demos from the talk.

***

**Parallax scrolling** has become quite popular in contemporary web design. This is understandable as it helps add a sense of depth and fluidity but most solutions are far from being perfect and are far too heavy on the cpu and noticeably choppy while scrolling.


### TL;DR version

This is the search for better parallax scrolling. The best approach uses translate3d and a single ticking requestAnimationFrame method that will make your parallax scroll much lighter and smoother.


### How do we measure performance?

To measure the performance of our methods we'll be using the [performance profiling capabilities](https://developers.google.com/chrome-developer-tools/docs/timeline) of the timeline tab in Google Chrome's developer inspector:

![Timeline tab](http://dev.form5.is/parallax/images/timeline.png)

Doing framerate optimizations is pretty much a limbo dance competition, touch the bars at your own risk! The green bars signal that rendering is being done by the CPU. Bars rising above 60fps are a clear indication of choppiness and those that touch 30fps or an even lower number are arrows aimed directly at a baby seal's heart. You don't want that on you conscience, do you?


### The demonstration

Following are three examples of different parallax techniques, the first two being common solutions and then we present the third method — Asparagus.

The (perhaps much too familiar) hero image is a very common design pattern these days, being a default with popular front-end frameworks like Twitter Bootstrap and Zurb's Foundation. Love it or hate it, it serves as a great example for showing the difference in performance between the most common parallax techniques and Asparagus.

![Our demonstration design](http://dev.form5.is/parallax/images/design.png)


### Technique 1: The Background Position Method

The first method is the background-position method where the background image placed on the `#hero` element. This is probably the most straightforward way of implementing parallax scrolling and it has been [demonstrated](http://coding.smashingmagazine.com/2011/07/12/behind-the-scenes-of-nike-better-world/) in [various tutorials](http://net.tutsplus.com/tutorials/html-css-techniques/simple-parallax-scrolling-technique/) around the web.

**The Markup**
```html
<div id="hero">
  <div class="hero-content">
    <h1>background-position</h1>
    <p>This parallax method updates background-position and is the slowest of all. Rendering takes place on the CPU.</p>
  </div>
</div>
```

```css
#hero {
  height: 750px;
  background: url('bg.jpg') 50% 0 no-repeat;
  background-size: cover;
}
```

This markup is nothing out of the ordinary and the actual parallax functionality takes place in the JavaScript where `updatePosition()` is fired on every scroll event which changes the hero area's `background-position` attribute. This creates the parallax effect while the user is scrolling.

```javascript
var updatePosition = function() {
  var hero = document.getElementById('hero');
  var scrollPos = window.pageYOffset / 2;
  hero.style['background-position'] = '50% ' + scrollPos + 'px';
};

window.addEventListener('scroll', updatePosition, false);
```

#### Results: Very, Very Bad

[View the demo](http://dev.form5.is/parallax/demo-bgpos.html)

The use of the background-position method, where rendering is handled by the CPU, results in terrible performance as can be clearly observed in the timeline measure we mentioned above.

![background-position performance](http://dev.form5.is/parallax/images/bgpos.png)

### Technique 2: The Relative Top Positioning and translateY Methods

Here we'll actually be showing two different methods (but both share the same markup) where the background is moved to a separate element and the position of the whole element is changed when scrolling (rather than updating the background position).


```html
  <div id="hero">
    <div id="hero-bg"></div>

    <div class="hero-content">
      <h1>translateY</h1>
      <p>This parallax method is probably the most common one. It has the background image on a seperate element and 2d translates that element onscroll. We can do better than this.</p>
    </div>
  </div>
```

On the CSS side, we're absolute positioning the background element.

``` css
#hero {
  position: relative;
  height: 750px;
  overflow: hidden;
}

#hero-bg {
  position: absolute;
  width: 100%;
  height: 750px;
  top: 0;
  bottom: 0;
  background: url('bg.jpg') 50% 0 no-repeat;
  background-size: cover;
}
```

In the JavaScript we have a function that updates our translate settings on every scroll event.

On one hand, we can move the new background element with [relative positioning using the `top` attribute](http://www.webdesignerdepot.com/2013/07/how-to-create-a-simple-parallax-effect/).

On the other hand, we can make use of the `translateY` attribute. The latter delivers [better performance](http://www.paulirish.com/2012/why-moving-elements-with-translate-is-better-than-posabs-topleft/) as `translateY` takes rendering to the GPU level. Both methods can be observed below but we'll be using the latter for this demonstration.

```javascript
updatePosition = function() {
  var heroBg = document.getElementById('hero-bg');
  var newPos = window.pageYOffset / 2;

  translateY(heroBg, newPos);
  // We could use relative top positioning here instead
  // but that will always be slower
  // heroBg.style.top = newPos + 'px';
};

function translateY(elm, value) {
  var translate = 'translateY(' + value + 'px)';
  elm.style['-webkit-transform'] = translate;
  elm.style['-moz-transform'] = translate;
  elm.style['-ms-transform'] = translate;
  elm.style['-o-transform'] = translate;
  elm.style.transform = translate;
}

window.addEventListener('scroll', updatePosition, false);
```

#### Results: It's Alright - But We Can Do Better

[View the demo](http://dev.form5.is/parallax/demo-translate.html)

![translateY performance](http://dev.form5.is/parallax/images/translate.png)

The `translateY` performance for this technique is much better than the one we saw for technique 1 (`background-position`) but we're still seeing spikes of slow rendering. We need to take this to the next level.

### Technique 3: Asparagus

We could settle for the other techniques but Asparagus is where we [Bump the Lamp](http://www.helloerik.com/bump-the-lamp-the-reason-for-caring)".

'But why?' you may ask, feeling that the other techniques are good enough. We've discussed the individual performance issues above but lets focus on the two general problems. First, as the performance profiling indicated (the green bars, remember), the GPU isn't being utilized nearly as much as it could with the most common methods. Secondly, calculations are being done at a **much higher** rate than is actually needed, causing constant reflow and repaint in the browser.

This is where requestAnimationFrame and translate3d come to the rescue.

To limit the rate at which calculation is being done we'll be using the awesome requestAnimationFrame (rAF) API. Without going into too much detail, rAF collects your constant rendering updates into a single reflow and repaint cycle, and this ensures that your animation calculation is being done in a balanced 'sweetspot' of constant calculation and smooth rendering. To learn more about rAF I recommend reading [this article](http://www.paulirish.com/2011/requestanimationframe-for-smart-animating/) by Paul Irish and [that article](http://www.html5rocks.com/en/tutorials/speed/animations/) by Paul Lewis.

The markup is the same as we used above in technique 2 but we'll be using `translate3d(x,y,z)` instead of `translateY(y)` for the actual translation of the background element. This will do wonders for our rendering even though we're only going to be using the y paramter of `translate3d` with 0px given for the x and z axis.

So lets take a look at what's happening under the hood.

We start off by attaching a simple function to the window's scroll event:
``` javascript
var lastScrollY = 0,
    ticking = false,
    bgElm = document.getElementById('hero-bg'),
    speedDivider = 2;

// Update scroll value and request tick
var doScroll = function() {
  lastScrollY = window.pageYOffset;
  requestTick();
};

window.addEventListener('scroll', doScroll, false);
```

As you can see, the `lastScrollY` variable is being updated for each scroll event and `requestTick()` is being called. This will pass our `updatePosition` function to the the rAF API. What it also does is ensure that the background position isn't being updated multiple times concurrently:

```javascript
var requestTick = function() {
  if (!ticking) {
    window.requestAnimationFrame(updatePosition);
    ticking = true;
  }
};
```

`translate3d` is used in the function rather than `translateY` which allow the true power of the GPU to be unleashed.

```javascript
var updatePosition = function() {
  var translateValue = lastScrollY / speedDivider;

  // We don't want parallax to happen if scrollpos is below 0
  if (translateValue < 0)
    translateValue = 0;

  translateY3d(bgElm, translateValue);

  // Stop ticking
  ticking = false;
};

// Translates an element on the Y axis using translate3d
// to ensure that the rendering is done by the GPU
var translateY3d = function(elm, value) {
  var translate = 'translate3d(0px,' + value + 'px, 0px)';
  elm.style['-webkit-transform'] = translate;
  elm.style['-moz-transform'] = translate;
  elm.style['-ms-transform'] = translate;
  elm.style['-o-transform'] = translate;
  elm.style.transform = translate;
};
```

#### The Results: We Have a Winner!

The performance optimization can be seen very clearly by [looking at the demo](http://dev.form5.is/parallax/asparagus.html) but we'll also need objective measures to see whether `requestAnimationFrame` combined with `translate3d` is the silver bullet for doing parallax animation as we hope.

The timeline now shows a different picture. The green bars have almost vanished and are now being replaced with unfilled bars. This means that rendering is no longer being done by the CPU and has moved to the much faster GPU.

![Asparagus performance](http://dev.form5.is/parallax/images/asparagus.png)


#### About The Author

Olafur Nielsen is a web developer with a huge passion for good user experience. He is a Co-Founder of [Form5](http://form5.is), an interactive studio based in Reykjavík, Iceland. Check us out at [twitter](http://twitter.com/Form5) or even [GitHub](https://github.com/Form5).
