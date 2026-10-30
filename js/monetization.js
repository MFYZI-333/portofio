(() => {
  "use strict";

  const config = window.MAFIOUZI_CONFIG || {};
  const articles = window.MAFIOUZI_ARTICLES || [];
  const ga4Id = typeof config.ga4MeasurementId === "string" && /^G-[A-Z0-9]+$/i.test(config.ga4MeasurementId)
    ? config.ga4MeasurementId
    : "";
  const publisherId = typeof config.adsensePublisherId === "string" && /^ca-pub-\d+$/.test(config.adsensePublisherId)
    ? config.adsensePublisherId
    : "";
  const adSlots = config.adSlots && typeof config.adSlots === "object" ? config.adSlots : {};
  const configuredAds = publisherId ? Object.entries(adSlots).filter(([, slot]) => typeof slot === "string" && /^\d+$/.test(slot)) : [];
  const hasOptionalServices = Boolean(ga4Id || configuredAds.length);
  const consentKey = "mafiouzi-optional-services-consent";
  const canonicalUrl = document.querySelector('link[rel="canonical"]')?.href || "https://mfyzi.com/";
  let analyticsLoaded = false;
  let adsLoaded = false;

  if (config.ga4MeasurementId && !ga4Id) console.error("MAFIOUZI: Set ga4MeasurementId to a valid Google Analytics 4 ID (G-...).");
  if (config.adsensePublisherId && !publisherId) console.error("MAFIOUZI: Set adsensePublisherId to the publisher ID provided by AdSense (ca-pub-...).");
  if (publisherId) {
    Object.entries(adSlots).forEach(([name, slot]) => {
      if (slot && (typeof slot !== "string" || !/^\d+$/.test(slot))) {
        console.error(`MAFIOUZI: Ad slot "${name}" must be the numeric slot ID provided by AdSense.`);
      }
    });
  }

  const addStructuredData = (value) => {
    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.textContent = JSON.stringify(value).replace(/</g, "\\u003c");
    document.head.append(script);
  };

  const setMetaContent = (selector, content) => {
    const meta = document.querySelector(selector);
    if (meta) meta.content = content;
  };

  const currentPage = document.body.dataset.page;
  const organization = {
    "@type": "Organization",
    name: "MAFIOUZI",
    url: "https://mfyzi.com/",
    logo: "https://mfyzi.com/images/mafiouzi-profile.png"
  };

  if (currentPage === "home") {
    addStructuredData({
      "@context": "https://schema.org",
      "@graph": [
        organization,
        {
          "@type": "WebSite",
          name: "MAFIOUZI",
          url: "https://mfyzi.com/",
          description: "Discover Morocco and Algeria through travel, food and culture.",
          publisher: { "@id": "https://mfyzi.com/#organization" }
        }
      ].map((item) => item["@type"] === "Organization" ? { ...item, "@id": "https://mfyzi.com/#organization" } : item)
    });
  } else if (currentPage === "article") {
    const article = articles.find((item) => item.id === new URLSearchParams(location.search).get("id"));
    if (article) {
      const articleUrl = `https://mfyzi.com/article.html?id=${encodeURIComponent(article.id)}`;
      const image = article.image || "https://mfyzi.com/images/mafiouzi-profile.png";
      const canonical = document.querySelector('link[rel="canonical"]');
      if (canonical) canonical.href = articleUrl;
      setMetaContent('meta[property="og:url"]', articleUrl);
      setMetaContent('meta[property="og:title"]', `${article.title} | MAFIOUZI`);
      setMetaContent('meta[property="og:description"]', article.excerpt);
      setMetaContent('meta[property="og:image"]', image);
      setMetaContent('meta[name="twitter:title"]', `${article.title} | MAFIOUZI`);
      setMetaContent('meta[name="twitter:description"]', article.excerpt);
      setMetaContent('meta[name="twitter:image"]', image);
      const articleData = {
        "@context": "https://schema.org",
        "@type": "BlogPosting",
        headline: article.title,
        description: article.excerpt,
        image: [image],
        datePublished: article.date,
        author: { "@type": "Organization", name: "MAFIOUZI", url: "https://mfyzi.com/" },
        publisher: organization,
        mainEntityOfPage: articleUrl,
        articleSection: article.category,
        inLanguage: "en"
      };
      if (Array.isArray(article.tags) && article.tags.length) articleData.keywords = article.tags.join(", ");
      addStructuredData(articleData);
      addStructuredData({
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: "https://mfyzi.com/" },
          { "@type": "ListItem", position: 2, name: "Journal", item: "https://mfyzi.com/articles.html" },
          { "@type": "ListItem", position: 3, name: article.title, item: articleUrl }
        ]
      });
    }
  } else {
    const pageTypes = {
      articles: ["CollectionPage", "The MAFIOUZI Journal"],
      about: ["AboutPage", "About MAFIOUZI"],
      contact: ["ContactPage", "Contact MAFIOUZI"],
      privacy: ["WebPage", "MAFIOUZI Privacy"]
    };
    const page = pageTypes[currentPage];
    if (page) {
      addStructuredData({
        "@context": "https://schema.org",
        "@type": page[0],
        name: page[1],
        url: canonicalUrl,
        isPartOf: { "@type": "WebSite", name: "MAFIOUZI", url: "https://mfyzi.com/" },
        about: organization,
        inLanguage: "en"
      });
    }
  }

  const trackEvent = (name, parameters = {}) => {
    if (analyticsLoaded && typeof window.gtag === "function") window.gtag("event", name, parameters);
  };

  const loadAnalytics = () => {
    if (!ga4Id || analyticsLoaded) return;
    window.dataLayer = window.dataLayer || [];
    window.gtag = function () { window.dataLayer.push(arguments); };
    window.gtag("consent", "default", {
      analytics_storage: ga4Id ? "granted" : "denied",
      ad_storage: configuredAds.length ? "granted" : "denied",
      ad_user_data: configuredAds.length ? "granted" : "denied",
      ad_personalization: configuredAds.length ? "granted" : "denied"
    });
    window.gtag("js", new Date());
    window.gtag("config", ga4Id, { page_location: canonicalUrl, page_title: document.title });
    const script = document.createElement("script");
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(ga4Id)}`;
    script.onerror = () => console.error("MAFIOUZI: Google Analytics could not be loaded.");
    document.head.append(script);
    analyticsLoaded = true;
  };

  const loadAds = () => {
    if (!publisherId || !configuredAds.length || adsLoaded) return;
    const placements = [];
    configuredAds.forEach(([name, slotId]) => {
      const container = document.querySelector(`[data-ad-slot="${CSS.escape(name)}"]`);
      if (!container) return;
      const label = document.createElement("span");
      label.className = "ad-label";
      label.textContent = "Advertisement";
      const ad = document.createElement("ins");
      ad.className = "adsbygoogle";
      ad.style.display = "block";
      ad.dataset.adClient = publisherId;
      ad.dataset.adSlot = slotId;
      ad.dataset.adFormat = "auto";
      ad.dataset.fullWidthResponsive = "true";
      container.replaceChildren(label, ad);
      placements.push(ad);
    });
    if (!placements.length) return;

    const script = document.createElement("script");
    script.async = true;
    script.crossOrigin = "anonymous";
    script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${encodeURIComponent(publisherId)}`;
    script.onload = () => {
      placements.forEach(() => {
        try {
          (window.adsbygoogle = window.adsbygoogle || []).push({});
        } catch (error) {
          console.error("MAFIOUZI: An AdSense placement could not be initialized.", error);
        }
      });
    };
    script.onerror = () => console.error("MAFIOUZI: Google AdSense could not be loaded.");
    document.head.append(script);
    adsLoaded = true;
  };

  const loadOptionalServices = () => {
    loadAnalytics();
    loadAds();
  };

  const readConsent = () => {
    try {
      return localStorage.getItem(consentKey);
    } catch (error) {
      console.warn("MAFIOUZI: Optional-service consent could not be read from local storage.", error);
      return null;
    }
  };

  const saveConsent = (value) => {
    try {
      localStorage.setItem(consentKey, value);
    } catch (error) {
      console.warn("MAFIOUZI: Optional-service consent could not be saved.", error);
    }
  };

  let consentBanner;
  const closeConsentBanner = () => {
    if (consentBanner) consentBanner.hidden = true;
  };
  const showConsentBanner = () => {
    if (consentBanner) consentBanner.hidden = false;
  };

  if (hasOptionalServices) {
    consentBanner = document.createElement("section");
    consentBanner.className = "consent-banner";
    consentBanner.setAttribute("aria-label", "Optional cookies and services");
    consentBanner.setAttribute("aria-live", "polite");
    consentBanner.hidden = true;
    consentBanner.innerHTML = `
      <div class="consent-copy"><strong>Help us improve MAFIOUZI</strong><p>Optional Google Analytics and advertising services help us understand visits and support this journal. They load only if you accept. <a href="privacy.html">Privacy details</a></p></div>
      <div class="consent-actions"><button type="button" class="consent-accept" data-consent-action="accept">Accept optional cookies</button><button type="button" class="consent-reject" data-consent-action="reject">Reject optional</button><button type="button" class="consent-close" data-consent-action="close" aria-label="Close privacy settings">×</button></div>`;
    document.body.append(consentBanner);
    consentBanner.addEventListener("click", (event) => {
      const action = event.target instanceof Element ? event.target.closest("[data-consent-action]")?.dataset.consentAction : "";
      if (action === "accept") {
        saveConsent("accepted");
        loadOptionalServices();
        closeConsentBanner();
      } else if (action === "reject") {
        saveConsent("rejected");
        if (analyticsLoaded) {
          window.gtag("consent", "update", {
            analytics_storage: "denied",
            ad_storage: "denied",
            ad_user_data: "denied",
            ad_personalization: "denied"
          });
        }
        document.querySelectorAll(".ad-placement").forEach((placement) => placement.replaceChildren());
        closeConsentBanner();
      } else if (action === "close") {
        closeConsentBanner();
      }
    });

    if (readConsent() === "accepted") loadOptionalServices();
    else if (readConsent() !== "rejected") showConsentBanner();
  }

  document.querySelectorAll("[data-open-privacy]").forEach((button) => {
    button.addEventListener("click", () => {
      if (consentBanner) {
        showConsentBanner();
        consentBanner.querySelector(".consent-accept")?.focus();
      }
    });
  });

  document.addEventListener("click", (event) => {
    if (!(event.target instanceof Element) || !analyticsLoaded) return;
    if (event.target.closest("[data-consent-action], [data-open-privacy]")) return;
    const control = event.target.closest("a[href], button");
    if (!control) return;
    const label = (control.getAttribute("aria-label") || control.textContent || "").trim().replace(/\s+/g, " ").slice(0, 80);
    const link = control.matches("a[href]") ? control : null;
    if (link) {
      const target = new URL(link.href, location.href);
      if (/\.(pdf|zip|csv|docx?|xlsx?|pptx?)$/i.test(target.pathname) || link.hasAttribute("download")) {
        trackEvent("file_download", { file_name: target.pathname.split("/").pop() || "download" });
        return;
      }
      if (target.protocol === "mailto:" || target.protocol === "tel:") return;
      trackEvent(target.origin === location.origin ? "link_click" : "outbound_link_click", {
        link_text: label,
        link_url: `${target.origin}${target.pathname}`
      });
      return;
    }
    trackEvent("button_click", {
      button_text: label,
      button_area: control.closest("header, footer, main")?.tagName.toLowerCase() || "page"
    });
  });

  document.addEventListener("submit", (event) => {
    if (!(event.target instanceof HTMLFormElement)) return;
    const formType = event.target.matches("[data-newsletter-form]") ? "newsletter" : event.target.matches("[data-contact-form]") ? "contact" : "other";
    trackEvent("form_submit", { form_type: formType, result: "local_confirmation_only" });
  });

  document.querySelector("#article-search")?.addEventListener("keydown", (event) => {
    if (event.key === "Enter") trackEvent("search_submit", { search_area: "journal" });
  });

})();
