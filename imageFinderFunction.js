const cheerio = require("cheerio");
const puppeteerExtra = require("puppeteer-extra");
const StealthPlugin = require("puppeteer-extra-plugin-stealth");

const imageFinderFunction = async (html, parsedURL, shortenedURL, baseURL) => {
  let mainImage;
  const $ = cheerio.load(html);

  const cheerioImages = $("img");

  const cheerioHREF = $("a");
  let cheerioHREFArr = [];
  cheerioHREF.each((index, item) =>
    cheerioHREFArr.push(item.attribs.href ? item.attribs.href : null)
  );

  cheerioHREFArr = cheerioHREFArr.filter((x) =>
    /(w*(png)|(jpg)|(jpeg)|(ashx)w*)/.test(x)
  );

  const amazonCheerioImages = $("span > span > img");
  const amazonMainImageArr = [];
  amazonCheerioImages.each((index, item) =>
    amazonMainImageArr.push(item.attribs.src)
  );
  const cheerioDivs = $("div");
  const cheerioSources = $("source");
  const cheerioSourceArr = [];
  cheerioSources.each((index, item) => {
    if (item.attribs.srcset) {
      if (baseURL.includes("zitsticka.com")) {
        if (item.parent.parent.attribs.class) {
          if (
            item.parent.parent.attribs.class.includes(
              "c-reviewWidget-header-image"
            )
          ) {
            cheerioSourceArr.push(item.attribs.srcset.split(" ")[0]);
          }
        }
      } else {
        if (baseURL.includes("bergdorfgoodman.com")) {
          if (item.parent.parent.name === "div") {
            cheerioSourceArr.push(item.attribs.srcset.split(" ")[0]);
          }
        } else if (baseURL.includes("macys.com")) {
          if (item.parent.parent.attribs.class) {
            if (item.parent.parent.attribs.class.includes("main-img")) {
              cheerioSourceArr.push(item.attribs.srcset.split(" ")[0]);
            } else {
              return null;
            }
          } else {
            return null;
          }
        } else {
          cheerioSourceArr.push(item.attribs.srcset.split(" ")[0]);
        }
      }
    }
  });

  const cheerioMeta = $("meta");
  const cheerioMetaArr = [];
  cheerioMeta.each((index, item) => {
    if (item.attribs.itemprop === "image") {
      if (item.attribs.content) {
        cheerioMetaArr.push(item.attribs.content);
      }
    }
  });
  let pageTitle = $("title").text();

  const puppeteerGetTitle = async (page, browser) => {
    await page.setRequestInterception(true);

    // Prevent Javascript
    page.on("request", (request) => {
      request._interceptionHandled = false;
      request.continue();
      if (request.resourceType() === "script") {
        request._interceptionHandled = false;
        request.abort();
      }
    });

    page.on("error", (error) => console.error(error));

    await page
      .goto(shortenedURL, { waitUntil: "networkidle0" })
      .catch((e) => void 0);
    pageTitle = await page.title();

    await browser.close();
  };

  if (
    !pageTitle &&
    !baseURL.includes("loccitane.com") &&
    !baseURL.includes("tatcha.com")
  ) {
    puppeteerExtra.use(StealthPlugin());

    await puppeteerExtra
      .launch({
        headless: true,
        args: ["--no-sandbox", "--disable-features=site-per-process"],
        ignoreDefaultArgs: ["--enable-automation", "--disable-extensions"],
      })
      .then(async (browser) => {
        const page = await browser.newPage();
        await page.setDefaultNavigationTimeout(0);

        puppeteerGetTitle(page, browser);
      })
      .catch((err) => {
        console.log(err);
      });
  }

  const pageTitleArr = pageTitle
    .split(/[^[^A-Za-z0-9]+/g)
    .filter((x) => x.toLowerCase() !== "skin");
  const reformedPageTitle = pageTitleArr.join(" ").toLowerCase();

  const pageTitleMatchFunction = (item) => {
    const itemArr = item ? item.split(/[\s,\\/+&_\\.-]+/) : null;
    const matchedArr = [];

    if (itemArr) {
      for (let i = 0; i < pageTitleArr.length; i++) {
        for (let j = 0; j < itemArr.length; j++) {
          if (pageTitleArr[i].includes("\n")) {
            if (
              itemArr[j].toLowerCase() ===
              pageTitleArr[i].replace("\n", "").toLowerCase()
            ) {
              matchedArr.push(itemArr[j]);
            }
          } else {
            if (itemArr[j].toLowerCase() === pageTitleArr[i].toLowerCase()) {
              matchedArr.push(itemArr[j]);
            }
          }
        }
      }
    }

    if (matchedArr.length > 1) {
      return matchedArr.length;
    } else {
      return 0;
    }
  };

  let altURLExactMatchArr = [];

  const googleSearchPuppeteerFunction = async (page, browser) => {
    page.on("error", (error) => console.error(error));
    const shortenedURLArr = shortenedURL.split("/");
    const shortenedBaseUrl = baseURL.slice(baseURL.indexOf("www."));

    await page
      .goto(
        "http://images.google.com/search?tbm=isch&q=" +
          (baseURL.includes("loccitane.com")
            ? shortenedURL
            : baseURL.includes("philosophy.com")
            ? pageTitle
            : shortenedBaseUrl.split(".")[1] +
              " " +
              shortenedURLArr[shortenedURLArr.length - 1].split(".html")[0]),
        {
          waitUntil: "networkidle0",
        }
      )
      .catch((e) => void 0);

    const images = await page.evaluate(
      () =>
        Array.from(document.getElementsByTagName("img"), (e) => {
          if (e.className.includes("tx8vtf")) {
            return e.src;
          }
        }).filter((x) => x)[0]
    );

    await browser.close();

    return images;
  };

  if (
    baseURL.includes("loccitane.com") ||
    baseURL.includes("tatcha.com") ||
    baseURL.includes("philosophy.com")
  ) {
    puppeteerExtra.use(StealthPlugin());

    await puppeteerExtra
      .launch({
        headless: true,
        args: ["--disable-features=site-per-process"],
        ignoreDefaultArgs: ["--enable-automation", "--disable-extensions"],
      })
      .then(async (browser) => {
        const page = await browser.newPage();
        await page.setDefaultNavigationTimeout(0);

        const image = await googleSearchPuppeteerFunction(page, browser);

        if (image) {
          return altURLExactMatchArr.push({
            source: image,
            matches: 0,
          });
        } else {
          return null;
        }
      })
      .catch((err) => {
        console.log(err);
      });
  }

  const cheerioImageEachFuction = (outsideMatchesArr, index, item) => {
    const source = item.attribs.src
      ? !item.attribs.src.toLowerCase().includes("base64")
        ? item.attribs.src
        : null
      : null;
    const dataSource = item.attribs["data-src"]
      ? !item.attribs["data-src"].toLowerCase().includes("base64")
        ? item.attribs["data-src"]
        : null
      : null;
    let srcSetSource = item.attribs["srcset"]
      ? item.attribs["srcset"].split(",")
      : null;

    if (srcSetSource) {
      srcSetSource = srcSetSource[srcSetSource.length - 1].trim().split(" ")[0];
      if (srcSetSource.includes("base64")) {
        srcSetSource = null;
      }
    }

    const altArr = item.attribs.alt
      ? item.attribs.alt.split(/[^a-zA-Z0-9]/g).filter((x) => x !== "")
      : item.attribs["data-alt"]
      ? item.attribs["data-alt"].split(/[^a-zA-Z0-9]/g).filter((x) => x !== "")
      : null;

    let individualMatchesArr = [];

    const sourceURLMatchFunction = (source) => {
      const regexOnlyEnglishLetters = /^[a-z]+$/i;
      let sourceSectionArr = source ? source.split(/[\s,\/+&_-]+/) : null;
      const NOWFOODSRegex = /(w*(product_page_image)w*)/;
      const inkeyListRegex = /(w*(slider-1)w*)/;
      const clarinsRegex = /(w*(clarins-master-products)w*)/;

      if (sourceSectionArr) {
        for (let i = 0; i < sourceSectionArr.length; i++) {
          const camelCaseRegex = /([a-z])([A-Z])/;

          if (camelCaseRegex.test(sourceSectionArr[i])) {
            sourceSectionArr = sourceSectionArr.concat(
              sourceSectionArr[i]
                // insert a space before all caps
                .replace(/([A-Z])/g, " $1")
                .split(" ")
            );
          }
        }

        const matchedSourceArr = [];

        for (let i = 0; i < sourceSectionArr.length; i++) {
          if (regexOnlyEnglishLetters.test(sourceSectionArr[i])) {
            const regex = new RegExp(
              "(w*" + sourceSectionArr[i].toLowerCase() + "w*)"
            );

            if (parsedURL) {
              if (
                regex.test(
                  parsedURL.slice(parsedURL.indexOf("com") + 3).toLowerCase()
                ) ||
                (reformedPageTitle
                  ? altArr
                    ? altArr[i]
                      ? reformedPageTitle.includes(altArr[i].toLowerCase())
                      : null
                    : null
                  : null) ||
                (baseURL.includes("nowfoods") && NOWFOODSRegex.test(source)) ||
                (baseURL.includes("theinkeylist") &&
                  inkeyListRegex.test(source)) ||
                (baseURL.includes("clarinsusa") && clarinsRegex.test(source))
              ) {
                if (sourceSectionArr[i].length > 2) {
                  matchedSourceArr.push(sourceSectionArr[i]);
                }
              } else {
                if (regex.test(reformedPageTitle)) {
                  if (sourceSectionArr[i].length > 2) {
                    matchedSourceArr.push(sourceSectionArr[i]);
                  }
                }
              }
            } else {
              if (shortenedURL) {
                if (
                  regex.test(
                    shortenedURL
                      .slice(shortenedURL.indexOf("com") + 3)
                      .toLowerCase()
                  ) ||
                  (reformedPageTitleArr
                    ? altArr
                      ? reformedPageTitleArr.includes(altArr[i].toLowerCase())
                      : null
                    : null) ||
                  (baseURL.includes("nowfoods") &&
                    NOWFOODSRegex.test(source)) ||
                  (baseURL.includes("theinkeylist") &&
                    inkeyListRegex.test(source)) ||
                  (baseURL.includes("clarinsusa") && clarinsRegex.test(source))
                ) {
                  if (sourceSectionArr[i].length > 2) {
                    matchedSourceArr.push(sourceSectionArr[i]);
                  }
                }
              }
            }
          }
        }

        return matchedSourceArr;
      }
    };
    if (baseURL.includes("isdin.com") || baseURL.includes("biopelle.com")) {
      if (item.parent.attribs.class) {
        if (
          /(product-(primary|main)-image)/.test(
            item.parent.attribs.class.split(" ")[0]
          )
        ) {
          if (source || dataSource || srcSetSource) {
            return outsideMatchesArr.push({
              source: source || dataSource || srcSetSource,
              matches: 0,
            });
          }
        } else {
          return null;
        }
      }
    } else if (baseURL.includes("obagi.com")) {
      if (altArr && item.attribs["data-alt"]) {
        if (source || dataSource || srcSetSource) {
          return outsideMatchesArr.push({
            source: source || dataSource || srcSetSource,
            matches: 5,
          });
        }
      } else if (item.parent.name === "picture") {
        if (source || dataSource || srcSetSource) {
          return outsideMatchesArr.push({
            source: source || dataSource || srcSetSource,
            matches: 0,
          });
        }
      }
    } else if (
      baseURL.includes("bioclarity.com") ||
      baseURL.includes("eltamd.com")
    ) {
      if (
        /(product-details__image)|(wp-post-image)|(primary-image)/.test(
          item.attribs.class
        )
      ) {
        if (source || dataSource || srcSetSource) {
          return outsideMatchesArr.push({
            source: source || dataSource || srcSetSource,
            matches: 5,
          });
        }
      } else {
        return null;
      }
    } else if (
      baseURL.includes("follain.com") ||
      baseURL.includes("thesaemcosmetic.com")
    ) {
      if (/(Image--0)|(thumnailImgId)/.test(item.attribs.id)) {
        if (source || dataSource || srcSetSource) {
          return outsideMatchesArr.push({
            source: source || dataSource || srcSetSource,
            matches: 5,
          });
        }
      } else {
        return null;
      }
    } else if (baseURL.includes("walgreens.com")) {
      if (item.attribs.alt) {
        if (/(Product Large Image)/.test(item.attribs.alt)) {
          if (source || dataSource || srcSetSource) {
            return outsideMatchesArr.push({
              source: source || dataSource || srcSetSource,
              matches: 5,
            });
          }
        } else {
          return null;
        }
      }
    } else if (
      baseURL.includes("lushusa.com") ||
      baseURL.includes("tomford.com") ||
      baseURL.includes("loccitane.com") ||
      baseURL.includes("lorealparisusa.com") ||
      baseURL.includes("laroche-posay")
    ) {
      if (
        /(pdp-main-img)|(primary-image)|(primary_image)|(product-image)/.test(
          item.attribs.class
        )
      ) {
        if (source || dataSource || srcSetSource) {
          return outsideMatchesArr.push({
            source: source || dataSource || srcSetSource,
            matches: 5,
          });
        }
      } else {
        return null;
      }
    } else if (
      baseURL.includes("skinbiologique.com") ||
      baseURL.includes("origins.com") ||
      baseURL.includes("organysbeauty.com") ||
      baseURL.includes("peachandlily.com") ||
      baseURL.includes("drdennisgross.com") ||
      baseURL.includes("cremedelamer.com") ||
      baseURL.includes("gotoskincare.com")
    ) {
      if (
        /(zoomImg)|(js-product-image)|(wp-post-image)|(fotorama__img)|(js-product-image)|(Image--fadeIn)/.test(
          item.attribs.class
        )
      ) {
        if (source) {
          return outsideMatchesArr.push({
            source: source,
            matches: 5,
          });
        } else if (dataSource || srcSetSource) {
          if (!baseURL.includes("gotoskincare.com")) {
            return outsideMatchesArr.push({
              source: dataSource || srcSetSource,
              matches: 5,
            });
          } else {
            return null;
          }
        }
      } else {
        return null;
      }
    } else if (
      baseURL.includes("bulldogskincare.com") ||
      baseURL.includes("cosrx.com")
    ) {
      if (
        /(lslide active)|(gallery-placeholder)/.test(item.parent.attribs.class)
      ) {
        if (source || dataSource || srcSetSource) {
          return outsideMatchesArr.push({
            source: source || dataSource || srcSetSource,
            matches: 5,
          });
        }
      } else {
        return null;
      }
    } else if (baseURL.includes("burtsbees.com")) {
      if (item.attribs["img-type"]) {
        if (/(1\.0)/.test(item.attribs["img-type"])) {
          if (item.attribs["data-hires"]) {
            return outsideMatchesArr.push({
              source: item.attribs["data-hires"],
              matches: 5,
            });
          }
        } else {
          return null;
        }
      } else {
        return null;
      }
    } else if (baseURL.includes("molecular-cosmetics.com")) {
      if (item.attribs.alt === "image-1") {
        if (source || dataSource || srcSetSource) {
          return outsideMatchesArr.push({
            source: source || dataSource || srcSetSource,
            matches: 5,
          });
        }
      } else {
        return null;
      }
    } else if (baseURL.includes("weleda.com")) {
      if (item.attribs.class === "banner") {
        if (source || dataSource || srcSetSource) {
          return outsideMatchesArr.push({
            source: source || dataSource || srcSetSource,
            matches: 5,
          });
        }
      } else {
        return null;
      }
    } else if (
      baseURL.includes("23yearsold.net") ||
      baseURL.includes("beautydiary.com")
    ) {
      if (
        item.parent.attribs.class === "Pic" ||
        item.parent.attribs.class === "product-pic"
      ) {
        if (source || dataSource || srcSetSource) {
          return outsideMatchesArr.push({
            source: source || dataSource || srcSetSource,
            matches: 5,
          });
        } else {
          return null;
        }
      } else {
        return null;
      }
    } else if (baseURL.includes("sanitas-skincare.com")) {
      if (/(woocommerce-LoopProduct-link)/.test(item.parent.attribs.class)) {
        return outsideMatchesArr.push({
          source: source || dataSource || srcSetSource,
          matches: 5,
        });
      } else if (item.attribs.class) {
        if (item.attribs.class.includes("prod_slider_main")) {
          return outsideMatchesArr.push({
            source: source || dataSource || srcSetSource,
            matches: 5,
          });
        } else {
          return null;
        }
      } else {
        return null;
      }
    } else if (baseURL.includes("cetaphil.com")) {
      if (item.attribs.class) {
        if (item.attribs.class.includes("img-responsive")) {
          return outsideMatchesArr.push({
            source: source || dataSource || srcSetSource,
            matches: 5,
          });
        } else {
          return null;
        }
      } else {
        return null;
      }
    } else if (baseURL.includes("aperire-en.com")) {
      if (item.parent.attribs.class) {
        if (item.parent.attribs.class.includes("slick_col")) {
          return outsideMatchesArr.push({
            source: source || dataSource || srcSetSource,
            matches: 5,
          });
        } else {
          return null;
        }
      } else {
        return null;
      }
    }

    const transparentPixelRegex = new RegExp(/transparent.*pixel/);

    const urlExactMatchPushFunction = (source) => {
      if (individualMatchesArr.length >= 2) {
        if (source) {
          if (
            !/logo|svg|spacer|loader|gif|bat\.bing|emstore.com_.jpg|badges|dummy|how|to_go|placeholder|tiny|review|banner|icon|typographic|stamped.io|sweetcef|bazaarvoice|editor|results|before|steps|subnav|btn|kiehls_us-library/gm.test(
              source.toLowerCase()
            )
          ) {
            if (
              baseURL.includes("aveeno") ||
              baseURL.includes("albertsons.com") ||
              baseURL.includes("lushusa.com")
            ) {
              return outsideMatchesArr.push({
                source: source,
                matches: individualMatchesArr.length,
              });
            } else {
              if (
                !/(desktop)+/.test(source.toLowerCase()) &&
                !baseURL.includes("buly1803.com")
              ) {
                if (
                  baseURL.includes("peterthomasroth") ||
                  baseURL.includes("fresh.com") ||
                  baseURL.includes("kiehls.com") ||
                  baseURL.includes("clarinsusa") ||
                  baseURL.includes("lancome-usa") ||
                  baseURL.includes("differin")
                ) {
                  if (baseURL.includes("clarinsusa")) {
                    if (
                      source
                        .toLowerCase()
                        .includes("sites-clarins-master-products")
                    ) {
                      return outsideMatchesArr.push({
                        source: source,
                        matches: individualMatchesArr.length,
                      });
                    }
                  } else if (
                    !transparentPixelRegex.test(source.toLowerCase())
                  ) {
                    return outsideMatchesArr.push({
                      source: source,
                      matches: individualMatchesArr.length,
                    });
                  }
                } else if (!transparentPixelRegex.test(source.toLowerCase())) {
                  return outsideMatchesArr.push({
                    source: source,
                    matches: individualMatchesArr.length,
                  });
                }
              } else {
                if (!/default/gm.test(source.toLowerCase())) {
                  if (!transparentPixelRegex.test(source.toLowerCase())) {
                    return outsideMatchesArr.push({
                      source: source,
                      matches: individualMatchesArr.length,
                    });
                  }
                }
              }
            }
          }
        }
      } else {
        const titleMatch = pageTitleMatchFunction(item.attribs.alt);

        if (titleMatch) {
          if (source) {
            if (
              !/logo|svg|spacer|loader|gif|bat\.bing|emstore.com_.jpg|badges|dummy|how|to_go|placeholder|tiny|review|banner|icon|typographic|stamped.io|sweetcef|bazaarvoice|editor|results|before|steps|subnav|btn|kiehls_us-library/gm.test(
                source.toLowerCase()
              )
            ) {
              if (
                baseURL.includes("aveeno")
                  ? true
                  : /(desktop)+/.test(source.toLowerCase())
              ) {
                if (
                  baseURL.includes("peterthomasroth") ||
                  baseURL.includes("fresh.com") ||
                  baseURL.includes("kiehls.com") ||
                  baseURL.includes("clarinsusa") ||
                  baseURL.includes("lancome-usa")
                ) {
                  if (!transparentPixelRegex.test(source.toLowerCase())) {
                    return outsideMatchesArr.push({
                      source: source,
                      matches: individualMatchesArr.length,
                    });
                  }
                } else {
                  if (!/default/gm.test(source.toLowerCase())) {
                    if (!transparentPixelRegex.test(source.toLowerCase())) {
                      return outsideMatchesArr.push({
                        source: source,
                        matches: individualMatchesArr.length,
                      });
                    }
                  }
                }
              }
            }
          }
        }
      }
    };

    if (altArr) {
      if (altArr.length > 0) {
        const regexOnlyEnglishLetters = /^[a-z]+$/i;

        if (altArr.length < 20) {
          for (let i = 0; i < altArr.length; i++) {
            if (regexOnlyEnglishLetters.test(altArr[i])) {
              const regex = new RegExp("(w*" + altArr[i].toLowerCase() + "w*)");
              if (
                regex.test(
                  shortenedURL
                    .slice(shortenedURL.indexOf("com") + 3)
                    .toLowerCase()
                    .split("/")
                    .sort(function (a, b) {
                      return b.length - a.length;
                    })[0]
                ) ||
                pageTitle.includes(altArr[i])
              ) {
                if (altArr[i].length > 2) {
                  individualMatchesArr.push(altArr[i]);
                }
              } else {
                if (baseURL.includes("ahava")) {
                  const conditions = ["main", "product", "photo"];
                  if (
                    conditions.some((x) => altArr[i].toLowerCase().includes(x))
                  ) {
                    individualMatchesArr.push(altArr[i]);
                  }
                }
              }
            }
          }
        }

        if (individualMatchesArr.length <= 3 || altArr.length > 20) {
          const sourceMatchArr = sourceURLMatchFunction(
            source || dataSource || srcSetSource
          );

          individualMatchesArr = individualMatchesArr.concat(sourceMatchArr);
        }
        urlExactMatchPushFunction(source || dataSource || srcSetSource);
      }
    } else if (source || dataSource || srcSetSource) {
      let sourceMatchArr = sourceURLMatchFunction(
        source || dataSource || srcSetSource
      );

      if (individualMatchesArr.length >= 2) {
        individualMatchesArr = individualMatchesArr.concat(sourceMatchArr);
        urlExactMatchPushFunction(source || dataSource || srcSetSource);
      } else {
        if (baseURL.includes("target") || baseURL.includes("fresh.com")) {
          if (item.parent.name === "picture") {
            return outsideMatchesArr.push({
              source: source || dataSource || srcSetSource,
              matches: 0,
            });
          }
        } else if (
          baseURL.includes("nowfoods") ||
          baseURL.includes("theinkeylist") ||
          baseURL.includes("mariobadescu") ||
          baseURL.includes("eminenceorganics")
        ) {
          if (sourceMatchArr.length > 2) {
            return outsideMatchesArr.push({
              source: source || dataSource || srcSetSource,
              matches: sourceMatchArr.length,
            });
          }
        }
      }
    }
  };

  const cheerioDivEachFunction = (outsideMatchesArr, index, item) => {
    const dataSource = item.attribs["data-src"]
      ? item.attribs["data-src"]
      : item.attribs["data-img-src"]
      ? item.attribs["data-img-src"]
      : null;

    const individualMatchesArr = [];

    if (baseURL.includes("tonymoly")) {
      if (dataSource) {
        return outsideMatchesArr.push({
          source: dataSource,
          matches: 100,
        });
      }
    }
    const sourceURLMatchFunction = (source) => {
      const regexOnlyEnglishLetters = /^[a-z]+$/i;
      let sourceSectionArr = source ? source.split(/[\s,\/+&_-]+/) : null;

      if (sourceSectionArr) {
        for (let i = 0; i < sourceSectionArr.length; i++) {
          const camelCaseRegex = /([a-z])([A-Z])/;

          if (camelCaseRegex.test(sourceSectionArr[i])) {
            sourceSectionArr = sourceSectionArr.concat(
              sourceSectionArr[i]
                // insert a space before all caps
                .replace(/([A-Z])/g, " $1")
                .split(" ")
            );
          }
        }

        for (let i = 0; i < sourceSectionArr.length; i++) {
          if (regexOnlyEnglishLetters.test(sourceSectionArr[i])) {
            const regex = new RegExp(
              "(w*" + sourceSectionArr[i].toLowerCase() + "w*)"
            );
            if (parsedURL) {
              if (
                regex.test(
                  parsedURL.slice(parsedURL.indexOf("com") + 3).toLowerCase()
                )
              ) {
                if (sourceSectionArr[i].length > 2) {
                  individualMatchesArr.push(sourceSectionArr[i]);
                }
              } else {
                if (regex.test(reformedPageTitle)) {
                  if (sourceSectionArr[i].length > 2) {
                    individualMatchesArr.push(sourceSectionArr[i]);
                  }
                }
              }
            } else {
              if (shortenedURL) {
                if (
                  regex.test(
                    shortenedURL
                      .slice(shortenedURL.indexOf("com") + 3)
                      .toLowerCase()
                  )
                ) {
                  if (sourceSectionArr[i].length > 2) {
                    individualMatchesArr.push(sourceSectionArr[i]);
                  }
                }
              }
            }
          }
        }
      }
    };

    const transparentPixelRegex = new RegExp(/transparent.*pixel/);

    if (dataSource) {
      const sourceMatchArr = sourceURLMatchFunction(dataSource);

      if (sourceMatchArr) {
        if (sourceMatchArr.length >= 2) {
          if (
            !/logo|svg|spacer|loader|gif|bat\.bing|emstore.com_.jpg|badges|dummy|how|to_go|placeholder|tiny|review|banner|icon|typographic|stamped.io|sweetcef|bazaarvoice|editor|results|before|steps|subnav|btn|kiehls_us-library/gm.test(
              dataSource.toLowerCase()
            )
          ) {
            if (!transparentPixelRegex.test(dataSource.toLowerCase())) {
              return outsideMatchesArr.push({
                source: dataSource,
                matches: sourceMatchArr.length,
              });
            }
          }
        }
      }
    }
  };

  let matchesArr = [];

  cheerioImages.each((index, item) =>
    cheerioImageEachFuction(matchesArr, index, item)
  );

  cheerioDivs.each((index, item) =>
    cheerioDivEachFunction(matchesArr, index, item)
  );

  if (cheerioSourceArr.length > 0) {
    for (let i = 0; i < cheerioSourceArr.length; i++) {
      matchesArr.push({
        source: cheerioSourceArr[i],
        matches: 0,
      });
    }
  }

  if (cheerioMetaArr.length > 0) {
    for (let i = 0; i < cheerioMetaArr.length; i++) {
      matchesArr.push({
        source: cheerioMetaArr[i],
        matches: 0,
      });
    }
  }

  if (cheerioHREFArr.length > 0) {
    for (let i = 0; i < cheerioHREFArr.length; i++) {
      matchesArr.push({
        source: cheerioHREFArr[i],
        matches: 0,
      });
    }
  }

  if (amazonMainImageArr.length > 0) {
    for (let i = 0; i < amazonMainImageArr.length; i++) {
      matchesArr.push({
        source: amazonMainImageArr[i],
        matches: 0,
      });
    }
  }

  if (altURLExactMatchArr.length > 0) {
    matchesArr = matchesArr.concat(altURLExactMatchArr);
  }

  const regexMatchReplaceFunction = (source) => {
    const regexArr = [
      {
        regex: /(w*_\d+x\d+w*)/,
        replace: "",
      },
      {
        regex: /(w*\?\d+w*)/,
        replace: "",
      },
      {
        regex: /(w*\?v=\d+w*)/,
        replace: "",
      },
      {
        regex: /(w*\?width=\d+w*)/,
        replace: "",
      },
      {
        regex: /(w*\?height=\d+w*)/,
        replace: "",
      },
      {
        regex: /(w*\?fit=\w+w*)/,
        replace: "",
      },
      {
        regex: /(w*\?auto=\w+w*)/,
        replace: "",
      },
      {
        regex: /(w*\?format=\w+w*)/,
        replace: "",
      },
      {
        regex: /(w*\?q=\d+w*)/,
        replace: "",
      },
      {
        regex: /(w*\?w=\d+w*)/,
        replace: "",
      },
      {
        regex: /(w*\?h=\d+w*)/,
        replace: "",
      },
      {
        regex: /(w*\?crop=\w+w*)/,
        replace: "",
      },
      {
        regex: /(w*\?dpr=\d+w*)/,
        replace: "",
      },
      {
        regex: /(w*\?fm=\w+w*)/,
        replace: "",
      },
      {
        regex: /(w*\?ixlib=\w+w*)/,
        replace: "",
      },
      {
        regex: /(w*\?s=\w+w*)/,
        replace: "",
      },
      {
        regex: /(w*\?cs=\w+w*)/,
        replace: "",
      },
      {
        regex: /(w*\?bg=\w+w*)/,
        replace: "",
      },
      {
        regex: /(w*\?pad=\d+w*)/,
        replace: "",
      },
      {
        regex: /(w*\?border=\d+w*)/,
        replace: "",
      },
      {
        regex: /(w*\?corner-radius=\d+w*)/,
        replace: "",
      },
      {
        regex: /(w*\?highlight=\w+w*)/,
        replace: "",
      },
      {
        regex: /(w*\?blur=\d+w*)/,
        replace: "",
      },
      {
        regex: /(w*\?px=\d+w*)/,
        replace: "",
      },
      {
        regex: /(w*\?usm=\d+w*)/,
        replace: "",
      },
      {
        regex: /(w*\?usmrad=\d+w*)/,
        replace: "",
      },
      {
        regex: /(w*\?sat=\d+w*)/,
        replace: "",
      },
      {
        regex: /(w*\?con=\d+w*)/,
        replace: "",
      },
      {
        regex: /(w*\?bri=\d+w*)/,
        replace: "",
      },
      {
        regex: /(w*\?exp=\d+w*)/,
        replace: "",
      },
      {
        regex: /(w*\?gam=\d+w*)/,
        replace: "",
      },
      {
        regex: /(w*\?high=\d+w*)/,
        replace: "",
      },
      {
        regex: /(w*\?shad=\d+w*)/,
        replace: "",
      },
      {
        regex: /(w*\?hue=\d+w*)/,
        replace: "",
      },
      {
        regex: /(w*\?invert=\d+w*)/,
        replace: "",
      },
      {
        regex: /(w*\?mod=\d+w*)/,
        replace: "",
      },
      {
        regex: /(w*\?sepia=\d+w*)/,
        replace: "",
      },
      {
        regex: /(w*\?mono=\w+w*)/,
        replace: "",
      },
      {
        regex: /(w*\?blend=\w+w*)/,
        replace: "",
      },
      {
        regex: /(w*\?balph=\d+w*)/,
        replace: "",
      },
      {
        regex: /(w*\?bm=\w+w*)/,
        replace: "",
      },
      {
        regex: /(w*\?ba=\w+w*)/,
        replace: "",
      },
      {
        regex: /(w*\?bp=\w+w*)/,
        replace: "",
      },
      {
        regex: /(w*\?bs=\w+w*)/,
        replace: "",
      },
      {
        regex: /(w*\?bx=\d+w*)/,
        replace: "",
      },
      {
        regex: /(w*\?by=\d+w*)/,
        replace: "",
      },
      {
        regex: /(w*\?bw=\d+w*)/,
        replace: "",
      },
      {
        regex: /(w*\?bh=\d+w*)/,
        replace: "",
      },
      {
        regex: /(w*\?trim=\w+w*)/,
        replace: "",
      },
      {
        regex: /(w*\?trimcolor=\w+w*)/,
        replace: "",
      },
      {
        regex: /(w*\?trimtol=\d+w*)/,
        replace: "",
      },
      {
        regex: /(w*\?trimpad=\d+w*)/,
        replace: "",
      },
      {
        regex: /(w*\?txt=\w+w*)/,
        replace: "",
      },
      {
        regex: /(w*\?txtsize=\d+w*)/,
        replace: "",
      },
      {
        regex: /(w*\?txtfont=\w+w*)/,
        replace: "",
      },
      {
        regex: /(w*\?txtcolor=\w+w*)/,
        replace: "",
      },
      {
        regex: /(w*\?txtalign=\w+w*)/,
        replace: "",
      },
      {
        regex: /(w*\?txtpad=\d+w*)/,
        replace: "",
      },
      {
        regex: /(w*\?txtfit=\w+w*)/,
        replace: "",
      },
      {
        regex: /(w*\?txtlead=\d+w*)/,
        replace: "",
      },
      {
        regex: /(w*\?txtlineclr=\w+w*)/,
        replace: "",
      },
      {
        regex: /(w*\?txtline=\d+w*)/,
        replace: "",
      },
      {
        regex: /(w*\?txtshad=\d+w*)/,
        replace: "",
      },
      {
        regex: /(w*\?mark=\w+w*)/,
        replace: "",
      },
      {
        regex: /(w*\?markalign=\w+w*)/,
        replace: "",
      },
      {
        regex: /(w*\?markalpha=\d+w*)/,
        replace: "",
      },
      {
        regex: /(w*\?markbase=\w+w*)/,
        replace: "",
      },
      {
        regex: /(w*\?markfit=\w+w*)/,
        replace: "",
      },
      {
        regex: /(w*\?markh=\d+w*)/,
        replace: "",
      },
      {
        regex: /(w*\?markpad=\d+w*)/,
        replace: "",
      },
      {
        regex: /(w*\?markscale=\d+w*)/,
        replace: "",
      },
      {
        regex: /(w*\?markw=\d+w*)/,
        replace: "",
      },
      {
        regex: /(w*\?markx=\d+w*)/,
        replace: "",
      },
      {
        regex: /(w*\?marky=\d+w*)/,
        replace: "",
      },
      {
        regex: /(w*\?palette=\w+w*)/,
        replace: "",
      },
      {
        regex: /(w*\?colors=\d+w*)/,
        replace: "",
      },
      {
        regex: /(w*\?class=\w+w*)/,
        replace: "",
      },
      {
        regex: /(w*\?prefix=\w+w*)/,
        replace: "",
      },
      {
        regex: /(w*\?colorquant=\d+w*)/,
        replace: "",
      },
      {
        regex: /(w*\?colorquantpad=\d+w*)/,
        replace: "",
      },
      {
        regex: /(w*\?rect=\d+w*)/,
        replace: "",
      },
      {
        regex: /(w*\?faces=\d+w*)/,
        replace: "",
      },
      {
        regex: /(w*\?faceindex=\d+w*)/,
        replace: "",
      },
      {
        regex: /(w*\?facepad=\d+w*)/,
        replace: "",
      },
      {
        regex: /(w*\?facesort=\w+w*)/,
        replace: "",
      },
      {
        regex: /(w*\?ch=\w+w*)/,
        replace: "",
      },
      {
        regex: /(w*\?cw=\d+w*)/,
        replace: "",
      },
      {
        regex: /(w*\?cx=\d+w*)/,
        replace: "",
      },
      {
        regex: /(w*\?cy=\d+w*)/,
        replace: "",
      },
      {
        regex: /(w*\?fp-x=\d+w*)/,
        replace: "",
      },
      {
        regex: /(w*\?fp-y=\d+w*)/,
        replace: "",
      },
      {
        regex: /(w*\?fp-z=\d+w*)/,
        replace: "",
      },
      {
        regex: /(w*\?fp-debug=\w+w*)/,
        replace: "",
      },
      {
        regex: /(w*\?dl=\w+w*)/,
        replace: "",
      },
      {
        regex: /(w*\?lossless=\w+w*)/,
        replace: "",
      },
      {
        regex: /(w*\?nr=\d+w*)/,
        replace: "",
      },
      {
        regex: /(w*\?nrs=\d+w*)/,
        replace: "",
      },
      {
        regex: /(w*\?or=\d+w*)/,
        replace: "",
      },
      {
        regex: /(w*\?orient=\d+w*)/,
        replace: "",
      },
      {
        regex: /(w*\?flip=\w+w*)/,
        replace: "",
      },
      {
        regex: /(w*\?rot=\d+w*)/,
        replace: "",
      },
      {
        regex: /(w*\?auto=\w+w*)/,
        replace: "",
      },
      {
        regex: /(w*\?mask=\w+w*)/,
        replace: "",
      },
      {
        regex: /(w*\?duotone=\w+w*)/,
        replace: "",
      },
      {
        regex: /(w*\?duotone-alpha=\d+w*)/,
        replace: "",
      },
      {
        regex: /(w*\?blend-size=\w+w*)/,
        replace: "",
      },
      {
        regex: /(w*\?blend-crop=\w+w*)/,
        replace: "",
      },
      {
        regex: /(w*\?blend-fit=\w+w*)/,
        replace: "",
      },
      {
        regex: /(w*\?blend-h=\d+w*)/,
        replace: "",
      },
      {
        regex: /(w*\?blend-mode=\w+w*)/,
        replace: "",
      },
      {
        regex: /(w*\?blend-pad=\d+w*)/,
        replace: "",
      },
      {
        regex: /(w*\?blend-w=\d+w*)/,
        replace: "",
      },
      {
        regex: /(w*\?blend-x=\d+w*)/,
        replace: "",
      },
      {
        regex: /(w*\?blend-y=\d+w*)/,
        replace: "",
      },
      {
        regex: /(w*\?chromasub=\d+w*)/,
        replace: "",
      },
      {
        regex: /(w*\?colorprofile=\w+w*)/,
        replace: "",
      },
      {
        regex: /(w*\?cs=\w+w*)/,
        replace: "",
      },
      {
        regex: /(w*\?fill=\w+w*)/,
        replace: "",
      },
      {
        regex: /(w*\?fill-color=\w+w*)/,
        replace: "",
      },
      {
        regex: /(w*\?iptc=\w+w*)/,
        replace: "",
      },
      {
        regex: /(w*\?transparency=\w+w*)/,
        replace: "",
      },
      {
        regex: /(w*\?trim-color=\w+w*)/,
        replace: "",
      },
      {
        regex: /(w*\?trim-md=\d+w*)/,
        replace: "",
      },
      {
        regex: /(w*\?trim-sd=\d+w*)/,
        replace: "",
      },
      {
        regex: /(w*\?trim-tol=\d+w*)/,
        replace: "",
      },
      {
        regex: /(w*\?upscale=\w+w*)/,
        replace: "",
      },
      {
        regex: /(w*\?usm=\d+w*)/,
        replace: "",
      },
      {
        regex: /(w*\?usmrad=\d+w*)/,
        replace: "",
      },
      {
        regex: /(w*\?vibrance=\d+w*)/,
        replace: "",
      },
      {
        regex: /(w*\?vib=\d+w*)/,
        replace: "",
      },
      {
        regex: /(w*\?watermark=\w+w*)/,
        replace: "",
      },
      {
        regex: /(w*\?wm=\w+w*)/,
        replace: "",
      },
      {
        regex: /(w*\?wmalign=\w+w*)/,
        replace: "",
      },
      {
        regex: /(w*\?wmalpha=\d+w*)/,
        replace: "",
      },
      {
        regex: /(w*\?wmcolor=\w+w*)/,
        replace: "",
      },
      {
        regex: /(w*\?wmfit=\w+w*)/,
        replace: "",
      },
      {
        regex: /(w*\?wmh=\d+w*)/,
        replace: "",
      },
      {
        regex: /(w*\?wmpad=\d+w*)/,
        replace: "",
      },
      {
        regex: /(w*\?wmscale=\d+w*)/,
        replace: "",
      },
      {
        regex: /(w*\?wmtxt=\w+w*)/,
        replace: "",
      },
      {
        regex: /(w*\?wmtxtcolor=\w+w*)/,
        replace: "",
      },
      {
        regex: /(w*\?wmtxtfont=\w+w*)/,
        replace: "",
      },
      {
        regex: /(w*\?wmtxtsize=\d+w*)/,
        replace: "",
      },
      {
        regex: /(w*\?wmw=\d+w*)/,
        replace: "",
      },
      {
        regex: /(w*\?wmx=\d+w*)/,
        replace: "",
      },
      {
        regex: /(w*\?wmy=\d+w*)/,
        replace: "",
      },
    ];

    let newSource = source;

    for (let i = 0; i < regexArr.length; i++) {
      newSource = newSource.replace(regexArr[i].regex, regexArr[i].replace);
    }

    return newSource;
  };

  let largest_image;

  if (matchesArr.length > 0) {
    const whiteSpaceRegex = /^\s*$/;

    let mainCheerioImage = matchesArr
      .filter((x) => x.source)
      .filter(
        (x, index, self) =>
          index === self.findIndex((t) => t.source === x.source) ||
          !self.map((y) => y.source).includes(x.source)
      )
      .filter((x) => x.matches >= 2)
      .filter((x) => !whiteSpaceRegex.test(x.source))
      .filter(
        (x) =>
          !/logo|svg|spacer|loader|gif|bat\.bing|emstore.com_.jpg|badges|dummy|how|to_go|placeholder|tiny|review|banner|icon|typographic|stamped.io|sweetcef|bazaarvoice|editor|results|before|steps|subnav|btn|kiehls_us-library/gm.test(
            x.source.toLowerCase()
          ) &&
          (baseURL.includes("peterthomasroth")
            ? true
            : !/default/gm.test(x.source.toLowerCase()))
      );

    if (
      !baseURL.includes("glamglow") &&
      !baseURL.includes("ulta") &&
      !baseURL.includes("mariobadescu") &&
      !baseURL.includes("aquaphorus") &&
      !baseURL.includes("oneloveorganics.com") &&
      !baseURL.includes("alaffia.com") &&
      !baseURL.includes("emstore.com") &&
      !baseURL.includes("miirushop.com") &&
      !baseURL.includes("glowieco.com") &&
      !baseURL.includes("stylekorean.com") &&
      !baseURL.includes("edenbelle.com") &&
      !baseURL.includes("rodanandfields.com") &&
      !baseURL.includes("ponds.com") &&
      !baseURL.includes("molecular-cosmetics.com") &&
      !baseURL.includes("cerave.com") &&
      !baseURL.includes("generationclay.com") &&
      !baseURL.includes("katesomerville.com")
    ) {
      if (mainCheerioImage) {
        if (!baseURL.includes("blissworld.com")) {
          if (mainCheerioImage[0]) {
            if (mainCheerioImage[0].source) {
              mainCheerioImage = mainCheerioImage[0].source;
            }
          }
        } else {
          if (mainCheerioImage[1]) {
            if (mainCheerioImage[1].source) {
              mainCheerioImage = mainCheerioImage[1].source;
            }
          }
        }
      }
    }

    if (
      mainCheerioImage &&
      typeof mainCheerioImage === "string" &&
      !baseURL.includes("glamglow") &&
      !baseURL.includes("ulta") &&
      !baseURL.includes("mariobadescu") &&
      !baseURL.includes("aquaphorus") &&
      !baseURL.includes("oneloveorganics.com") &&
      !baseURL.includes("alaffia.com") &&
      !baseURL.includes("emstore.com") &&
      !baseURL.includes("miirushop.com") &&
      !baseURL.includes("glowieco.com") &&
      !baseURL.includes("stylekorean.com") &&
      !baseURL.includes("edenbelle.com") &&
      !baseURL.includes("rodanandfields.com") &&
      !baseURL.includes("ponds.com") &&
      !baseURL.includes("molecular-cosmetics.com") &&
      !baseURL.includes("cerave.com") &&
      !baseURL.includes("generationclay.com") &&
      !baseURL.includes("katesomerville.com")
    ) {
      if (
        !mainCheerioImage.includes("http://") &&
        !mainCheerioImage.includes("https://") &&
        !mainCheerioImage.includes(".com")
      ) {
        mainCheerioImage =
          baseURL + mainCheerioImage.slice(mainCheerioImage.indexOf("/"));
      }

      mainImage = regexMatchReplaceFunction(mainCheerioImage);
    } else if (!largest_image) {
      let newCheerioImageArr = [];

      cheerioImages.each((index, item) => {
        const source = item.attribs.src;
        const dataSource = item.attribs["data-src"];

        if (source) {
          newCheerioImageArr.push(source);
        } else {
          if (dataSource) {
            newCheerioImageArr.push(dataSource);
          }
        }
      });

      mainCheerioImage = newCheerioImageArr.sort(
        (a, b) => b.length - a.length
      )[0];

      if (mainCheerioImage) {
        if (
          !mainCheerioImage.includes("http://") &&
          !mainCheerioImage.includes("https://") &&
          !mainCheerioImage.includes(".com")
        ) {
          mainCheerioImage = baseURL + mainCheerioImage;
        }

        mainImage = mainCheerioImage;
      }
    }
  }
  return mainImage;
};

module.exports = imageFinderFunction;