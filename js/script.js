(() => {
  "use strict";

  const articles = window.MAFIOUZI_ARTICLES || [];
  const categoryLabels = { travel: "Travel", food: "Food", culture: "Culture" };
  const categoryColors = { travel: "green", food: "orange", culture: "sand" };
  const countryFlags = { Morocco: "🇲🇦", Algeria: "🇩🇿" };
  const fallbackImage = "https://images.unsplash.com/photo-1539020140153-e479b8c22e70?auto=format&fit=crop&w=1200&q=80";
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const formatCategory = (value) => String(value || "").replaceAll("-", " ");
  const escapeHtml = (value) => String(value ?? "").replace(/[&<>"']/g, (char) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  })[char]);
  const byRecent = (first, second) => second.date.localeCompare(first.date);

  const header = document.querySelector("[data-site-header]");
  const footer = document.querySelector("[data-site-footer]");
  const currentPage = document.body.dataset.page;

  if (header) {
    header.innerHTML = `
      <header class="site-header">
        <div class="nav-wrap section-wrap">
          <a class="brand" href="index.html" aria-label="MAFIOUZI home"><span class="brand-mark"><img src="images/mafiouzi-profile.png" alt=""></span><span class="brand-name">MAFIOUZI<small>PLACES · PLATES · PEOPLE</small></span></a>
          <button class="menu-toggle" type="button" aria-label="Open menu" aria-expanded="false"><span></span><span></span></button>
          <nav class="main-nav" aria-label="Main navigation">
            <a class="${currentPage === "home" ? "current" : ""}" href="index.html">Home</a>
            <a href="articles.html?category=travel">Travel</a><a href="articles.html?category=food">Food</a><a href="articles.html?category=culture">Culture</a>
            <a class="${currentPage === "articles" ? "current" : ""}" href="articles.html">Journal</a>
            <a class="${currentPage === "about" ? "current" : ""}" href="about.html">Our story</a>
            <a class="${currentPage === "contact" ? "current" : ""}" href="contact.html">Contact</a>
          </nav>
          <div class="nav-actions"><a class="nav-cta" href="articles.html">Explore the journal <span>↗</span></a><button class="theme-toggle" type="button" aria-label="Switch to dark mode" title="Toggle dark mode"><span class="theme-icon">☾</span></button></div>
        </div>
      </header>`;
  }

  if (footer) {
    footer.innerHTML = `
      <footer class="site-footer">
        <div class="footer-main section-wrap">
          <div class="footer-brand"><a class="brand brand-light" href="index.html"><span class="brand-mark"><img src="images/mafiouzi-profile.png" alt=""></span><span class="brand-name">MAFIOUZI<small>PLACES · PLATES · PEOPLE</small></span></a><p>A journal of Moroccan and Algerian places, food and living culture.</p><div class="social-links"><a href="https://www.instagram.com/" aria-label="Instagram">ig</a><a href="https://www.facebook.com/" aria-label="Facebook">fb</a><a href="https://www.youtube.com/" aria-label="YouTube">yt</a></div></div>
          <div class="footer-column"><h3>EXPLORE</h3><a href="index.html">Home</a><a href="articles.html">The journal</a><a href="articles.html?country=Morocco">Morocco 🇲🇦</a><a href="articles.html?country=Algeria">Algeria 🇩🇿</a><a href="articles.html?category=travel">Travel guides</a><a href="articles.html?category=food">Food stories</a></div>
          <div class="footer-column"><h3>MAFIOUZI</h3><a href="about.html">Our story</a><a href="contact.html">Get in touch</a><a href="privacy.html">Privacy policy</a><button class="privacy-settings" type="button" data-open-privacy>Privacy settings</button><a href="mailto:hello@mafiouzi.com">hello@mafiouzi.com</a><span>Made for curious travellers.</span></div>
          <div class="footer-signoff"><span>THE MAGHREB, UP CLOSE.</span><strong>✳</strong></div>
        </div>
        <div class="footer-bottom section-wrap"><span>© <span data-year></span> MAFIOUZI. All stories, all yours to discover.</span><span>Made with curiosity in North Africa.</span></div>
      </footer>`;
  }

  const categoryBadge = (article) => `<span class="category-badge badge-${categoryColors[article.category] || "green"}">${escapeHtml(article.subcategory || categoryLabels[article.category] || "Journal")}</span>`;

  const cardMarkup = (article, extraClass = "") => `
    <article class="article-card ${extraClass}">
      <a class="card-image" data-feature-transition href="article.html?id=${encodeURIComponent(article.id)}" tabindex="-1" aria-hidden="true"><img src="${escapeHtml(article.image || fallbackImage)}" alt="${escapeHtml(article.alt || article.title)}" loading="lazy"><span class="category-badge badge-${categoryColors[article.category] || "green"}">${escapeHtml(categoryLabels[article.category] || "Journal")}</span><span class="card-image-arrow">↗</span></a>
      <div class="card-content"><div class="card-meta"><span>${escapeHtml(countryFlags[article.country] || "")} ${escapeHtml(article.city || article.country)}</span><span class="meta-dot"></span><span>${escapeHtml(article.readTime)}</span></div><h3><a href="article.html?id=${encodeURIComponent(article.id)}">${escapeHtml(article.title)}</a></h3><p>${escapeHtml(article.excerpt)}</p><div class="card-author"><img class="author-avatar" src="images/mafiouzi-profile.png" alt="" loading="lazy"><span>${escapeHtml(article.author || "MAFIOUZI Journal")}</span><a class="card-read" href="article.html?id=${encodeURIComponent(article.id)}" aria-label="Read ${escapeHtml(article.title)}">↗</a></div></div>
    </article>`;

  const renderCardList = (element, list) => {
    if (element) element.innerHTML = list.map((article) => cardMarkup(article)).join("");
  };

  const observeReveals = (elements) => {
    if (!("IntersectionObserver" in window)) return;
    const observer = new IntersectionObserver((entries, currentObserver) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        currentObserver.unobserve(entry.target);
      });
    }, { threshold: 0.1 });
    elements.forEach((element, index) => {
      if (element.classList.contains("reveal")) return;
      element.classList.add("reveal");
      element.style.setProperty("--reveal-delay", `${Math.min(index % 3, 2) * 65}ms`);
      observer.observe(element);
    });
  };
  const enableCardDepth = (elements) => {
    if (reducedMotion || !window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    elements.forEach((card) => {
      if (card.dataset.depthReady) return;
      card.dataset.depthReady = "true";
      card.addEventListener("pointermove", (event) => {
        const bounds = card.getBoundingClientRect();
        card.style.setProperty("--tilt-x", `${((event.clientY - bounds.top) / bounds.height - 0.5) * -2}deg`);
        card.style.setProperty("--tilt-y", `${((event.clientX - bounds.left) / bounds.width - 0.5) * 2.5}deg`);
      });
      card.addEventListener("pointerleave", () => {
        card.style.setProperty("--tilt-x", "0deg");
        card.style.setProperty("--tilt-y", "0deg");
      });
    });
  };

  document.querySelectorAll('[data-article-list="popular-food"]').forEach((el) => {
    const featuredFoodIds = ["moroccan-tagine", "algerian-rechta", "moroccan-couscous", "algerian-chakhchoukha", "moroccan-pastilla", "algerian-mhadjeb", "moroccan-harira", "moroccan-chebakia"];
    renderCardList(el, featuredFoodIds.map((id) => articles.find((article) => article.id === id)).filter(Boolean));
  });
  document.querySelectorAll('[data-article-list="latest-travel"]').forEach((el) =>
    renderCardList(el, articles.filter((article) => article.category === "travel").sort(byRecent).slice(0, 3)));
  document.querySelectorAll('[data-article-list="latest-food"]').forEach((el) =>
    renderCardList(el, articles.filter((article) => article.category === "food").sort(byRecent).slice(0, 3)));
  document.querySelectorAll('[data-article-list="trending-destinations"], [data-article-list="trending-foods"]').forEach((el) => {
    const category = el.dataset.articleList === "trending-foods" ? "food" : "travel";
    const list = articles.filter((article) => article.trending && article.category === category).sort(byRecent).slice(0, 4);
    el.innerHTML = list.map((article, index) => `
      <article class="trending-item"><span class="trending-number">0${index + 1}</span><a class="trending-image" data-feature-transition href="article.html?id=${encodeURIComponent(article.id)}"><img src="${escapeHtml(article.image)}" alt="${escapeHtml(article.alt)}" loading="lazy"></a><div class="trending-copy"><span class="eyebrow">${escapeHtml(article.country)} · ${escapeHtml(article.subcategory)}</span><h3><a href="article.html?id=${encodeURIComponent(article.id)}">${escapeHtml(article.title)}</a></h3><div class="card-meta"><span>${escapeHtml(article.dateLabel)}</span><span class="meta-dot"></span><span>${escapeHtml(article.readTime)}</span></div></div><a class="trending-arrow" href="article.html?id=${encodeURIComponent(article.id)}" aria-label="Read ${escapeHtml(article.title)}">↗</a></article>`).join("");
  });
  document.querySelectorAll('[data-destination-list="featured"]').forEach((el) => {
    const ids = ["marrakech-first-timers", "chefchaouen-blue-city", "essaouira-slow-weekend", "algiers-white-city", "ghardaia-mzab-valley", "tamanrasset-sahara-guide"];
    el.innerHTML = ids.map((id, index) => articles.find((article) => article.id === id)).filter(Boolean).map((article, index) => `
      <a class="destination-card destination-card-${index + 1}" data-feature-transition href="article.html?id=${encodeURIComponent(article.id)}" aria-label="Explore ${escapeHtml(article.city)}, ${escapeHtml(article.country)}">
        <img src="${escapeHtml(article.image)}" alt="${escapeHtml(article.alt)}" loading="lazy"><span class="destination-wash"></span><span class="destination-overline">${escapeHtml(countryFlags[article.country])} &nbsp; ${escapeHtml(article.country.toUpperCase())} <i>·</i> ${escapeHtml(article.subcategory.toUpperCase())}</span>
        <span class="destination-card-copy"><span class="destination-region">${escapeHtml(article.region)}</span><strong>${escapeHtml(article.city)}</strong><span class="destination-discover">Explore destination <i>↗</i></span></span><span class="destination-index">0${index + 1}</span>
      </a>`).join("");
  });
  document.querySelectorAll("[data-culture-feature]").forEach((el) => {
    const article = articles.find((item) => item.category === "culture");
    if (!article) return;
    el.innerHTML = `<a class="culture-feature-image" data-feature-transition href="article.html?id=${encodeURIComponent(article.id)}"><img src="${escapeHtml(article.image)}" alt="${escapeHtml(article.alt)}" loading="lazy"></a><div class="culture-feature-copy"><span class="eyebrow">${escapeHtml(countryFlags[article.country])} &nbsp; ${escapeHtml(article.country)} · CULTURE</span><h3><a href="article.html?id=${encodeURIComponent(article.id)}">${escapeHtml(article.title)}</a></h3><p>${escapeHtml(article.excerpt)}</p><a class="text-link" href="article.html?id=${encodeURIComponent(article.id)}">Read the story <span>↗</span></a></div>`;
  });
  document.querySelectorAll('[data-article-list="hidden-gems"]').forEach((el) => {
    const list = articles.filter((article) => article.hiddenGem).slice(0, 2);
    el.innerHTML = list.map((article) => `<a class="hidden-gem-card" data-feature-transition href="article.html?id=${encodeURIComponent(article.id)}"><img src="${escapeHtml(article.image)}" alt="${escapeHtml(article.alt)}" loading="lazy"><span class="hidden-gem-overlay"></span><span class="hidden-gem-mark">A LITTLE LESS TRAVELLED</span><span class="hidden-gem-copy"><small>${escapeHtml(countryFlags[article.country])} ${escapeHtml(article.country)} · ${escapeHtml(article.subcategory)}</small><strong>${escapeHtml(article.city)}</strong><span>Explore the story&nbsp; ↗</span></span></a>`).join("");
  });

  const allArticlesGrid = document.querySelector('[data-article-list="all"]');
  if (allArticlesGrid) {
    const searchInput = document.querySelector("#article-search");
    const countryFilter = document.querySelector("#country-filter");
    const subcategoryFilter = document.querySelector("#subcategory-filter");
    const filterButtons = [...document.querySelectorAll("[data-filter]")];
    const resultsLabel = document.querySelector("[data-results-label]");
    const emptyState = document.querySelector("[data-empty-state]");
    const params = new URLSearchParams(location.search);
    let activeCategory = ["travel", "food", "culture"].includes(params.get("category")) ? params.get("category") : "all";
    const filterOptions = {
      travel: ["Cities", "Beaches", "Mountains", "Desert", "History", "Culture", "Travel Tips", "Hidden Gems", "Weekend Trips", "Budget Travel"],
      food: ["Moroccan Food", "Algerian Food", "Street Food", "Traditional Food", "Desserts", "Drinks", "Recipes"],
      culture: ["Architecture", "Traditions", "Markets", "History", "Hospitality"]
    };

    const updateSubcategories = () => {
      if (!subcategoryFilter) return;
      const selected = subcategoryFilter.value;
      const options = filterOptions[activeCategory] || [...new Set(articles.map((article) => article.subcategory))].sort();
      subcategoryFilter.innerHTML = '<option value="">All stories</option>' + options.map((option) => `<option value="${escapeHtml(option)}">${escapeHtml(option)}</option>`).join("");
      subcategoryFilter.value = options.includes(selected) ? selected : "";
    };

    const renderFilteredArticles = () => {
      const query = (searchInput?.value || "").trim().toLocaleLowerCase("en");
      const country = countryFilter ? countryFilter.value : params.get("country") || "";
      const tag = (params.get("tag") || "").toLocaleLowerCase("en");
      const subcategory = subcategoryFilter?.value || "";
      const results = articles.filter((article) => {
        const matchesCategory = activeCategory === "all" || article.category === activeCategory;
        const matchesCountry = !country || article.country === country;
        const normalizedSubcategory = subcategory.toLocaleLowerCase("en");
        const matchesSubcategory = !subcategory || article.subcategory.toLocaleLowerCase("en") === normalizedSubcategory || (article.tags || []).some((tag) => tag.toLocaleLowerCase("en") === normalizedSubcategory);
        const text = `${article.title} ${article.excerpt} ${article.author} ${article.category} ${article.subcategory} ${article.country} ${article.city} ${article.region} ${article.origin || ""} ${article.history || ""} ${(article.tags || []).join(" ")} ${(article.highlights || []).join(" ")} ${(article.ingredients || []).join(" ")}`.toLocaleLowerCase("en");
        const matchesQuery = !query || text.includes(query);
        const matchesTag = !tag || (article.tags || []).some((item) => item.toLocaleLowerCase("en").includes(tag));
        return matchesCategory && matchesCountry && matchesSubcategory && matchesQuery && matchesTag;
      });
      allArticlesGrid.innerHTML = results.map((article) => cardMarkup(article)).join("");
      if (resultsLabel) resultsLabel.textContent = `${results.length} ${results.length === 1 ? "story" : "stories"} to discover`;
      if (emptyState) emptyState.hidden = results.length > 0;
      allArticlesGrid.hidden = results.length === 0;
      observeReveals(allArticlesGrid.querySelectorAll(".article-card"));
      enableCardDepth(allArticlesGrid.querySelectorAll(".article-card"));
    };

    const setActiveFilter = (category) => {
      activeCategory = category;
      filterButtons.forEach((button) => {
        const selected = button.dataset.filter === category;
        button.classList.toggle("active", selected);
        button.setAttribute("aria-pressed", String(selected));
      });
      updateSubcategories();
      renderFilteredArticles();
    };

    filterButtons.forEach((button) => button.addEventListener("click", () => setActiveFilter(button.dataset.filter)));
    searchInput?.addEventListener("input", renderFilteredArticles);
    countryFilter?.addEventListener("change", renderFilteredArticles);
    subcategoryFilter?.addEventListener("change", renderFilteredArticles);
    document.querySelector("[data-reset-filters]")?.addEventListener("click", () => {
      if (searchInput) searchInput.value = "";
      if (countryFilter) countryFilter.value = "";
      params.delete("country");
      params.delete("tag");
      params.delete("category");
      history.replaceState(null, "", `${location.pathname}${params.size ? `?${params}` : ""}`);
      setActiveFilter("all");
    });
    filterButtons.forEach((button) => {
      const counter = button.querySelector("[data-count]");
      if (counter) counter.textContent = button.dataset.filter === "all" ? articles.length : articles.filter((article) => article.category === button.dataset.filter).length;
    });
    if (countryFilter && params.has("country")) countryFilter.value = params.get("country");
    setActiveFilter(activeCategory);
  }

  const detail = document.querySelector("[data-article-detail]");
  if (detail) {
    const article = articles.find((item) => item.id === new URLSearchParams(location.search).get("id"));
    if (!article) {
      detail.innerHTML = `<section class="not-found"><span>404</span><h1>This story is off the map.</h1><p>It may have moved. There are plenty more places to discover.</p><a class="button button-dark" href="articles.html">Back to the journal <span>↗</span></a></section>`;
    } else {
      document.title = `${article.title} | MAFIOUZI`;
      const canonicalUrl = `https://mfyzi.com/article.html?id=${encodeURIComponent(article.id)}`;
      const canonicalLink = document.querySelector('link[rel="canonical"]');
      if (canonicalLink) canonicalLink.href = canonicalUrl;
      const openGraphUrl = document.querySelector('meta[property="og:url"]');
      if (openGraphUrl) openGraphUrl.content = canonicalUrl;
      const description = document.querySelector('meta[name="description"]');
      if (description) description.content = article.excerpt;
      const related = (article.related || []).map((id) => articles.find((item) => item.id === id)).filter(Boolean).slice(0, 3);
      const tags = (article.tags || []).map((tag) => `<a href="articles.html?tag=${encodeURIComponent(tag)}">#${escapeHtml(tag)}</a>`).join("");
      const foodDetails = article.category === "food" ? `
        <section class="recipe-notebook">
          <div class="recipe-notebook-heading"><span class="eyebrow">FROM THE RECIPE NOTEBOOK</span><h2>A dish with <span class="accent-orange">a story.</span></h2></div>
          <div class="recipe-origin-grid"><div><span class="recipe-label">COUNTRY</span><strong>${escapeHtml(countryFlags[article.country])} ${escapeHtml(article.country)}</strong></div><div><span class="recipe-label">KNOWN IN</span><strong>${escapeHtml(article.city)}</strong></div><div><span class="recipe-label">REGION</span><strong>${escapeHtml(article.region)}</strong></div></div>
          <section class="recipe-section"><h3>What's in it</h3><ul class="ingredient-list">${(article.ingredients || []).map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul></section>
          <section class="recipe-section"><h3>Make it at home</h3><ol class="preparation-list">${(article.preparation || []).map((step) => `<li>${escapeHtml(step)}</li>`).join("")}</ol></section>
          <section class="recipe-history"><span class="recipe-label">ORIGIN &amp; HISTORY</span><p>${escapeHtml(article.history || article.origin)}</p></section>
        </section>` : "";
      const destinationDetails = article.category === "travel" ? `
        <section class="destination-notebook">
          <div class="recipe-notebook-heading"><span class="eyebrow">${escapeHtml(countryFlags[article.country])} &nbsp; DESTINATION NOTES</span><h2>Before you <span class="accent-green">go.</span></h2></div>
          <div class="recipe-origin-grid"><div><span class="recipe-label">COUNTRY</span><strong>${escapeHtml(article.country)}</strong></div><div><span class="recipe-label">REGION</span><strong>${escapeHtml(article.region)}</strong></div><div><span class="recipe-label">BEST TIME</span><strong>${escapeHtml(article.bestTime)}</strong></div><div><span class="recipe-label">DAILY BUDGET</span><strong>${escapeHtml(article.budget)}</strong></div></div>
          <section class="recipe-history"><span class="recipe-label">A LITTLE CONTEXT</span><p>${escapeHtml(article.origin || "")}</p></section>
          <section class="destination-highlights"><h3>Put these on your map</h3><div>${(article.highlights || []).map((item) => `<span>${escapeHtml(item)}</span>`).join("")}</div></section>
        </section>` : "";
      detail.innerHTML = `
        <nav class="breadcrumbs" aria-label="Breadcrumb"><a href="index.html">Home</a><span>·</span><a href="articles.html">Journal</a><span>·</span><span>${escapeHtml(categoryLabels[article.category])}</span><span>·</span><span>${escapeHtml(article.country)}</span></nav>
        <header class="article-header">${categoryBadge(article)}<h1>${escapeHtml(article.title)}</h1><p class="article-deck">${escapeHtml(article.excerpt)}</p><div class="article-byline"><img class="author-avatar" src="images/mafiouzi-profile.png" alt="" loading="lazy"><span><strong>${escapeHtml(article.author)}</strong><small>MAFIOUZI contributor</small></span><span class="byline-separator"></span><span><strong>${escapeHtml(article.dateLabel)}</strong><small>Published</small></span><span class="byline-separator"></span><span><strong>${escapeHtml(article.readTime)}</strong><small>Reading time</small></span></div></header>
        <figure class="article-cover"><img src="${escapeHtml(article.image)}" alt="${escapeHtml(article.alt)}"><figcaption>${escapeHtml(countryFlags[article.country])} &nbsp; ${escapeHtml(article.city)} · MAFIOUZI FIELD NOTES</figcaption></figure>
        <div class="article-body-layout"><article class="article-body"><p class="article-intro">${escapeHtml(article.intro)}</p>${(article.sections || []).map((section) => `<section><h2>${escapeHtml(section.heading)}</h2><p>${escapeHtml(section.text)}</p></section>`).join("")}${foodDetails}${destinationDetails}<aside class="takeaway-box"><span>✳</span><div><strong>THE MAFIOUZI NOTE</strong><p>${escapeHtml(article.takeaway)}</p></div></aside><div class="article-tags">${tags}</div><div class="share-row"><strong>Share this story</strong><button type="button" data-share="copy">Copy link <span>↗</span></button><button type="button" data-share="native">Share <span>＋</span></button><span class="share-message" aria-live="polite"></span></div></article><aside class="article-aside"><span class="eyebrow">${escapeHtml(countryFlags[article.country])} &nbsp; FROM ${escapeHtml(article.country.toUpperCase())}</span><p>${escapeHtml(article.city)}<br>${escapeHtml(article.region)}</p><a href="articles.html?country=${encodeURIComponent(article.country)}">More from ${escapeHtml(article.country)} <span>↗</span></a></aside></div>
        <div class="ad-placement" data-ad-slot="articleInContent" aria-label="Advertisement"></div>
        <section class="related-section"><div class="section-heading"><div class="section-intro"><span class="eyebrow">KEEP EXPLORING</span><h2>Related <span class="accent-green">stories.</span></h2></div><a class="text-link" href="articles.html">The whole journal <span>↗</span></a></div><div class="article-grid">${related.map((item) => cardMarkup(item)).join("")}</div></section>`;
      detail.querySelector('[data-share="copy"]')?.addEventListener("click", async () => {
        const message = detail.querySelector(".share-message");
        try {
          await navigator.clipboard.writeText(location.href);
          message.textContent = "Link copied.";
        } catch {
          message.textContent = "Copy unavailable. You can copy the address from your browser.";
        }
      });
      detail.querySelector('[data-share="native"]')?.addEventListener("click", async () => {
        if (!navigator.share) {
          detail.querySelector('[data-share="copy"]')?.click();
          return;
        }
        try {
          await navigator.share({ title: article.title, text: article.excerpt, url: location.href });
        } catch (error) {
          if (error.name !== "AbortError") detail.querySelector(".share-message").textContent = "Sharing is unavailable right now.";
        }
      });
    }
  }

  document.querySelectorAll("[data-newsletter-form], [data-contact-form]").forEach((form) => {
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const message = form.querySelector(".form-message");
      message.textContent = form.matches("[data-newsletter-form]")
        ? "Thanks for joining us. Connect this form to your email platform to collect subscriptions."
        : "Thanks for reaching out. Connect this form to a mail provider to receive messages.";
      form.reset();
    });
  });

  const themeToggle = document.querySelector(".theme-toggle");
  const themeIcon = document.querySelector(".theme-icon");
  const savedTheme = localStorage.getItem("mafiouzi-theme");
  const prefersDark = window.matchMedia?.("(prefers-color-scheme: dark)").matches;
  const applyTheme = (isDark) => {
    document.body.classList.toggle("dark-mode", isDark);
    if (themeIcon) themeIcon.textContent = isDark ? "☀" : "☾";
    themeToggle?.setAttribute("aria-label", isDark ? "Switch to light mode" : "Switch to dark mode");
  };
  applyTheme(savedTheme ? savedTheme === "dark" : Boolean(prefersDark));
  themeToggle?.addEventListener("click", () => {
    const isDark = !document.body.classList.contains("dark-mode");
    applyTheme(isDark);
    localStorage.setItem("mafiouzi-theme", isDark ? "dark" : "light");
  });

  const menuToggle = document.querySelector(".menu-toggle");
  const mainNav = document.querySelector(".main-nav");
  const closeMenu = () => {
    menuToggle?.setAttribute("aria-expanded", "false");
    menuToggle?.setAttribute("aria-label", "Open menu");
    mainNav?.classList.remove("is-open");
    document.body.classList.remove("menu-open");
  };
  menuToggle?.addEventListener("click", () => {
    const isOpen = menuToggle.getAttribute("aria-expanded") !== "true";
    menuToggle.setAttribute("aria-expanded", String(isOpen));
    menuToggle.setAttribute("aria-label", isOpen ? "Close menu" : "Open menu");
    mainNav?.classList.toggle("is-open", isOpen);
    document.body.classList.toggle("menu-open", isOpen);
  });
  mainNav?.querySelectorAll("a").forEach((link) => link.addEventListener("click", closeMenu));
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeMenu();
  });

  const backToTop = document.createElement("button");
  backToTop.className = "back-to-top";
  backToTop.type = "button";
  backToTop.textContent = "↑";
  backToTop.setAttribute("aria-label", "Back to top");
  document.body.append(backToTop);
  window.addEventListener("scroll", () => backToTop.classList.toggle("visible", window.scrollY > 500), { passive: true });
  backToTop.addEventListener("click", () => window.scrollTo({ top: 0, behavior: reducedMotion ? "auto" : "smooth" }));
  document.querySelectorAll("[data-year]").forEach((element) => { element.textContent = new Date().getFullYear(); });

  observeReveals(document.querySelectorAll(".article-card, .destination-card, .country-panel, .culture-feature, .hidden-gem-card, .trending-item, .about-story, .values-grid article"));
  enableCardDepth(document.querySelectorAll(".article-card"));

  const loader = document.createElement("div");
  loader.className = "page-loader";
  loader.setAttribute("aria-label", "Loading MAFIOUZI");
  loader.innerHTML = '<span class="loader-wordmark">MAFIOUZI</span><span class="loader-track"><i></i></span>';
  document.body.append(loader);
  window.setTimeout(() => {
    loader.classList.add("is-done");
    window.setTimeout(() => loader.remove(), reducedMotion ? 0 : 360);
  }, reducedMotion ? 0 : 180);

  const transitionLayer = document.createElement("div");
  transitionLayer.className = "category-transition";
  transitionLayer.setAttribute("aria-hidden", "true");
  transitionLayer.innerHTML = '<img class="transition-image" alt=""><div class="transition-shade"></div><div class="transition-copy"><span class="transition-kicker">STEP INTO YOUR NEXT GOOD THING</span><strong class="transition-title"></strong><span class="transition-detail"></span><span class="transition-brand">MAFIOUZI <i>✳</i></span></div>';
  document.body.append(transitionLayer);

  let navigating = false;
  document.addEventListener("click", (event) => {
    const link = event.target.closest("a[href]");
    if (!link || link.target === "_blank" || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    if (link.getAttribute("href").startsWith("#")) return;
    const featureLink = link.matches("[data-feature-transition]") ? link : link.closest("[data-feature-transition]");
    const destination = new URL(link.href, location.href);
    if (destination.origin !== location.origin || !destination.pathname.endsWith(".html") || destination.href === location.href || navigating) return;

    event.preventDefault();
    navigating = true;
    if (featureLink && !reducedMotion) {
      const image = featureLink.querySelector("img");
      const transitionImage = transitionLayer.querySelector(".transition-image");
      const bounds = featureLink.getBoundingClientRect();
      transitionLayer.style.setProperty("--origin-x", `${event.clientX || bounds.left + bounds.width / 2}px`);
      transitionLayer.style.setProperty("--origin-y", `${event.clientY || bounds.top + bounds.height / 2}px`);
      transitionImage.src = image?.currentSrc || image?.src || fallbackImage;
      const title = featureLink.querySelector(".destination-card-copy strong, .hidden-gem-copy strong, .category-copy strong, h3");
      transitionLayer.querySelector(".transition-title").textContent = title?.textContent?.trim() || featureLink.textContent.trim().slice(0, 48) || "DISCOVER";
      const meta = featureLink.querySelector(".destination-overline, .hidden-gem-copy small, .category-copy > span");
      transitionLayer.querySelector(".transition-detail").textContent = meta?.textContent?.trim() || "A STORY FROM MOROCCO & ALGERIA";
      transitionLayer.classList.add("is-active");
      window.setTimeout(() => window.location.assign(destination.href), 560);
      return;
    }
    document.body.classList.add("page-leaving");
    window.setTimeout(() => window.location.assign(destination.href), reducedMotion ? 0 : 190);
  });

  document.addEventListener("pointerdown", (event) => {
    const control = event.target.closest(".button, .filter-button, .theme-toggle, .menu-toggle, .card-read, .trending-arrow");
    if (!control) return;
    control.classList.add("is-pressed");
    window.setTimeout(() => control.classList.remove("is-pressed"), 180);
  });
})();
