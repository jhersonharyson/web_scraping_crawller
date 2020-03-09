

const firstScript = document.getElementsByTagName('script')[0]
const js = document.createElement('script');
js.src = 'https://cdnjs.cloudflare.com/ajax/libs/axios/0.19.0/axios.js';
firstScript.parentNode.insertBefore(js, firstScript);


const findPropertyWithNames = [
  "CASA CIVIL DA GOVERNADORIA",
  "CASA MILITAR DA GOVERNADORIA",
  "PROCURADORIA GERAL DO ESTADO"
];

const identifyPropertyWithNames = [
  {
    key: "TERMO ADITIVO A CONTRATO",
    match: ["termo aditivo", "ta ao contrato", "tac "],
    endMatch: ["Protocolo: "]
  },
  {
    key: "TERMO ADITIVO A CONVÊNIO",
    match: ["termo aditivo", "ta ao contrato"]
  },
  {
    key: "DIÁRIA",
    match: ["termo aditivo", "ta ao contrato"]
  },
  {
    key: "PORTARIA",
    match: ["termo aditivo", "ta ao contrato"]
  },
  {
    key: "OUTRAS MATÉRIAS",
    match: ["termo aditivo", "ta ao contrato"]
  },
  {
    key: "ADMISSÃO DE SERVIDOR",
    match: ["termo aditivo", "ta ao contrato"]
  },
  {
    key: "FÉRIAS",
    match: ["termo aditivo", "ta ao contrato"]
  },
  {
    key: "AVISO DE RESULTADO DE LICITAÇÃO",
    match: ["termo aditivo", "ta ao contrato"]
  },
  {
    key: "ERRATA",
    match: ["termo aditivo", "ta ao contrato"]
  },
  {
    key: "LICENÇA PARA TRATAMENTO DE SAÚDE",
    match: ["termo aditivo", "ta ao contrato"]
  },
  {
    key: "CONTRATO",
    match: ["termo aditivo", "ta ao contrato"]
  },
  {
    key: "DESIGNAÇÃO DE SERVIDOR",
    match: ["termo aditivo", "ta ao contrato"]
  },
  {
    key: "SUPRIMENTO DE FUNDO",
    match: ["termo aditivo", "ta ao contrato"]
  }
];

const getBasicInfos = pages => {
  const numberOfDocument = getNumberOfDocument(pages);
  const dateOfDocument = getDateOfDocument(pages);
  return { numberOfDocument, dateOfDocument };
};

const getNumberOfDocument = pages => {
  const i = 6;
  const page = pages[i];
  const elements = page.getElementsByTagName("div");

  const element = elements[2];
  const text = element.innerText;
  // code in the start
  if (text.indexOf("D") >= 0) {
    return text.substr(text.indexOf("D") + 1); // skip start code 
  } else {
    // code in the end
    return text.substr(0, text.indexOf(" ")); // skip end code 
  }
};

const getDateOfDocument = pages => {
  const i = 6;
  const page = pages[i];
  const elements = page.getElementsByTagName("div");

  const element = elements[1];
  const text = element.innerText;
  return text.split(", ")[1];
};

const getFontSize = pages => {
  let matchFontSize = 0.0;

  for (let i = 6; i < pages.length; i++) {
    const page = pages[i];
    const elements = page.querySelectorAll("span");
    for (const element of elements) {
      if (findPropertyWithNames.indexOf(element.innerText) >= 0) {
        matchFontSize += convertFontSizeToNumber(
          computedStyle(element, "font-size")
        );
      }
    }
  }
  return (matchFontSize /= 3);
};

const buildPagesWithOneColumn = pages => {
  let newPages = [];
  for (let i = 6; i < pages.length; i++) {
    const page = pages[i];

    const pageWidth = page.offsetWidth;
    const breakMargin = pageWidth / 2;
    let newPageWithOneColumn = [];

    let [elementsAtTheLeft, elementsAtTheRight] = [[], []];
    let lastLineL = null;
    let lastLineR = null;
    let LineL = [];
    let LineR = [];
    const elements = page.getElementsByTagName("div");

    for (let i = 2; i < elements.length; i++) {
      const element = elements[i];
      if (element.offsetLeft < breakMargin) {
        if (lastLineL != element.offsetTop) {
          lastLineL = element.offsetTop;
          elementsAtTheLeft.push(LineL);
          LineL = [];
        }
        LineL.push(element);
      } else {
        if (lastLineR != element.offsetTop) {
          lastLineR = element.offsetTop;
          elementsAtTheRight.push(LineR);
          LineR = [];
        }
        LineR.push(element);
      }
    }

    elementsAtTheLeft.push(LineL);
    elementsAtTheRight.push(LineR);

    newPageWithOneColumn.push([...elementsAtTheLeft, ...elementsAtTheRight]);

    newPages.push(...newPageWithOneColumn);
  }
  return newPages;
};

const getPages = () => {
  return document.querySelectorAll("body > div");
};

const buildOnePage = newPages => {
  let onePage = [];
  for (const page of newPages) {
    onePage = onePage.concat(...page);
  }
  return onePage;
};

const computedStyle = (element, propertyValue) => {
  return window.getComputedStyle(element, null).getPropertyValue(propertyValue);
};

const convertFontSizeToNumber = fontSize => {
  return new Number(fontSize.replace("px", ""));
};

const findSpanInAnElements = elements => {
  return elements.querySelector("span");
};

const buildCatalogWithMatchFontSize = (onePage, matchFontSize) => {
  let content = [];
  let object = { data: [] };

  for (const elements of onePage) {
    const element = findSpanInAnElements(elements);
    const elementFontSize = convertFontSizeToNumber(
      computedStyle(element, "font-size")
    );

    // if data is a organ catalog then
    if (
      matchFontSize == elementFontSize &&
      !!element.innerText &&
      element.innerText == element.innerText.toUpperCase()
    ) {
      // dont cataloged yet
      if (!!object.name) {
        // init catalog
        content.push(object);
      }

      // cataloged but data are in two diferents lines
      if (!object.data.length) {
        // remove last cataloged
        content.pop();
        // put removed cataloged with next line
        object = { name: `${object.name} ${element.innerText}`, data: [] };
      } else {
        // put cataloged object in content
        object = { name: element.innerText, data: [] };
      }
    } else {
      // put content of a organ in the next lines
      object["data"].push(element.innerText);
    }
  }
  return content;
};

const searchForAnIdentityElementAndCount = content => {
  let protocol = [];
  let count = {};
  let text = [];
  content.forEach(element => {
    let key = null;
    let begin = false;
    let lastIndex = 0;
    let elementDataCutter = element.data;
    element.data.forEach(data => {
      [identifyPropertyWithNames[0]].forEach(search => {
        if (data.indexOf(search.key) >= 0 && key == null) {
          // begin matching
          //alert("init");
          key = data;
          return;
        }

        if (
          !!search.match.filter(
            m => data.toLowerCase().indexOf(m.toLowerCase()) >= 0
          ).length &&
          key != null
        ) {
          //alert("begin");
          begin = true;
          // alert(data);
          lastIndex = elementDataCutter.indexOf(data);
          return;
        }

        if (
          !!search.endMatch.filter(
            m => data.toLowerCase().indexOf(m.toLowerCase()) >= 0
          ).length &&
          begin
        ) {
          begin = false;
          //alert("end");

          //protocol.push(Number(data.split(" ")[1]));
          index = elementDataCutter.indexOf(data) + 1;

          // console.info({
          //   data,
          //   lastIndex,
          //   index,
          //   t: index <= lastIndex,
          //   di: element.data[index + 1],
          //   dl: element.data[lastIndex]
          // });

          text = elementDataCutter.slice(lastIndex, index);
          elementDataCutter = elementDataCutter.slice(lastIndex + 1);
          lastIndex = elementDataCutter.indexOf(data) + 1;
          // end
          if (!count[element.name]) {
            count[element.name] = {
              [search.key]: {
                count: 1,
                content: [[...new Set(text)].join(" \n\n ")]
              }
            };
            text = [];
          } else {
            count[element.name] = {
              ...count[element.name],
              [search.key]: {
                count: count[element.name][search.key].count + 1,
                content: [
                  ...count[element.name][search.key].content,
                  [...new Set(text)].join(" \n\n ")
                ]
              }
            };
            text = [];
          }

          return;
        }
      });
    });
  });
  console.log("");
  console.log("** protocols founded: ");
  console.info(protocol);
  return count;
};

const showResults = (result, info = "") => {
  console.log(info);
  console.log(result);
};

const extractDataFromPage = pages => {
  const onePage = buildOnePage(buildPagesWithOneColumn(pages));

  const content = buildCatalogWithMatchFontSize(onePage, getFontSize(pages));

  return searchForAnIdentityElementAndCount(content);
};

const minePages = () => {

  const basicDocumentInformations = getBasicInfos(getPages())
  let data = extractDataFromPage(getPages());

  showResults( basicDocumentInformations , "** basic document info");
  showResults( data , "** data");



  Object.keys(data).forEach(organKey => {
    Object.keys(data[organKey]).forEach(contentKey => {
      [...data[organKey][contentKey].content].map(content => {
        let text = content;

        text = text
          .toLowerCase()
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "")
          .replace(/\n\n/g, "     ")
          .replace(/\/\/ /g, "     ")
          .replace(/ \/\//g, "     ")
          .replace(/D*\/\/D*/g, "     ")
          .replace(/      /g, "")
          .replace(/    /g, "");

        // remove stopwords
        for (const regex of stopwords) {
          text = text.replace(regex, " ");
        }

        // remove wrappedWords
        const regexWrappedWords = /\w-\s+\w+/g;

        wrappedWords = [];

        while ((matches = regexWrappedWords.exec(text))) {
          wrappedWords.push({ text: matches[0], index: matches.index });
        }

        for (const word of wrappedWords) {
          text = text.replace(word.text, word.text.replace(/-\s+/, ""));
        }

        // console.log(text);

        const regexAttriburtes = / \w*\s*\w*:/gi;

        allMatches = [];
        while ((matches = regexAttriburtes.exec(text))) {
          allMatches.push({ text: matches[0], index: matches.index });
        }
        // console.log(allMatches);
        content = [];
        for (let index = 0; index < allMatches.length - 1; index++) {
          content.push(
            text
              .substr(
                allMatches[index].index,
                allMatches[index + 1].index - allMatches[index].index
              )
              .replace(allMatches[index + 1].text, "")
              .trim()
              .split(":")
          );
        }

        if (
          data[organKey][contentKey].scrapedContent &&
          data[organKey][contentKey].scrapedContent[0]
        ) {
          data[organKey][contentKey].scrapedContent.push(content);
        } else {
          data[organKey][contentKey].scrapedContent = [content];
        }
      });
    });
  });

  sendDataToServer(prepereAllDataBeforeSend(basicDocumentInformations, prepareOrgansDataBeforaSend(data)))

};

document.addEventListener("DOMContentLoaded", () => {
  minePages();
});

const prepareOrgansDataBeforaSend = (data) => {
  let dataOrgans = []

  for(const term in data){
    let terms = []
    for(const description in data[term]) {
      let dataScrapped = []
      data[term][description].scrapedContent.forEach(data => {
        let lines = []
        data.forEach( d =>{
          lines.push({data: d})
        })
      dataScrapped.push({dataScrapped: lines})
    })

      data[term][description].scrapedContent = dataScrapped
      terms.push({description, dataContent: data[term][description]})
    }
    dataOrgans.push({organName: term, terms})
  }
  return dataOrgans
}
const prepereAllDataBeforeSend = (basicDocumentInformations, prepareOrgansDataBeforaSend) => {
  return {
    fileName: "ARQUIVO X",
    sourceUrl: "c:/arquivo_aqui/arquivo.txt",
    date: Date.now(),
    dateOfDocument: basicDocumentInformations.dateOfDocument.split(" nº ")[1],
    numberOfDocument: basicDocumentInformations.numberOfDocument,
    organ: prepareOrgansDataBeforaSend
  }
}
const sendDataToServer = async (data) => {
  // const response = await axios.post('https://scrapper-connector.herokuapp.com/scrapper', data)
  const response = await axios.post('http://10.0.0.101:8080/scraper', data)
  console.log(response)
}

// {
//     'y': and x < w/2 // push
//     'y2'
// }
// {
//     'page': 0,
//     'header_left': '',
//     'number': 0,
//     'reader_right': '',
//     'date': ''
//     'SecretariesAndOrgans': []
// }

const stopwords = [
  / de /gi,
  / a /gi,
  / o /gi,
  / que /gi,
  / e /gi,
  / do /gi,
  / da /gi,
  / em /gi,
  / um /gi,
  / para /gi,
  / é /gi,
  / com /gi,
  / não /gi,
  / uma /gi,
  / os /gi,
  / no /gi,
  / se /gi,
  / na /gi,
  / por /gi,
  / mais /gi,
  / as /gi,
  / dos /gi,
  / como /gi,
  / mas /gi,
  / foi /gi,
  / ao /gi,
  / ele /gi,
  / das /gi,
  / tem /gi,
  / à /gi,
  / seu /gi,
  / sua /gi,
  / ou /gi,
  / ser /gi,
  / quando /gi,
  / muito /gi,
  / há /gi,
  / nos /gi,
  / já /gi,
  / está /gi,
  / eu /gi,
  / também /gi,
  / só /gi,
  / pelo /gi,
  / pela /gi,
  / até /gi,
  / isso /gi,
  / ela /gi,
  / entre /gi,
  / era /gi,
  / depois /gi,
  / sem /gi,
  / mesmo /gi,
  / aos /gi,
  / ter /gi,
  / seus /gi,
  / quem /gi,
  / nas /gi,
  / me /gi,
  / esse /gi,
  / eles /gi,
  / estão /gi,
  / você /gi,
  / tinha /gi,
  / foram /gi,
  / essa /gi,
  / num /gi,
  / nem /gi,
  / suas /gi,
  / meu /gi,
  / às /gi,
  / minha /gi,
  / têm /gi,
  / numa /gi,
  / pelos /gi,
  / elas /gi,
  / havia /gi,
  / seja /gi,
  / qual /gi,
  / será /gi,
  / nós /gi,
  / tenho /gi,
  / lhe /gi,
  / deles /gi,
  / essas /gi,
  / esses /gi,
  / pelas /gi,
  / este /gi,
  / fosse /gi,
  / dele /gi,
  / tu /gi,
  / te /gi,
  / vocês /gi,
  / vos /gi,
  / lhes /gi,
  / meus /gi,
  / minha /gi,
  / teu /gi,
  / tua /gi,
  / teus /gi,
  / tua /gi,
  / nosso /gi,
  / nossa /gi,
  / nossos /gi,
  / nossa /gi,
  / dela /gi,
  / delas /gi,
  / esta /gi,
  / estes /gi,
  / estas /gi,
  / aquele /gi,
  / aquela /gi,
  / aqueles /gi,
  / aquelas /gi,
  / isto /gi,
  / aquilo /gi,
  / estou /gi,
  / está /gi,
  / estamos /gi,
  / estão /gi,
  / estive /gi,
  / esteve /gi,
  / estivemos /gi,
  / estiveram /gi,
  / estava /gi,
  / estávamos /gi,
  / estavam /gi,
  / estivera /gi,
  / estivéramos /gi,
  / esteja /gi,
  / estejamos /gi,
  / estejam /gi,
  / estivesse /gi,
  / estivéssemos /gi,
  / estivessem /gi,
  / estiver /gi,
  / estivermos /gi,
  / estiverem /gi,
  / hei /gi,
  / há /gi,
  / havemos /gi,
  / hão /gi,
  / houve /gi,
  / houvemos /gi,
  / houveram /gi,
  / houvera /gi,
  / houvéramos /gi,
  / haja /gi,
  / hajamos /gi,
  / hajam /gi,
  / houvesse /gi,
  / houvéssemos /gi,
  / houvessem /gi,
  / houver /gi,
  / houvermos /gi,
  / houverem /gi,
  / houverei /gi,
  / houverá /gi,
  / houveremos /gi,
  / houverão /gi,
  / houveria /gi,
  / houveríamos /gi,
  / houveriam /gi,
  / sou /gi,
  / somos /gi,
  / são /gi,
  / era /gi,
  / éramos /gi,
  / eram /gi,
  / fui /gi,
  / foi /gi,
  / fomos /gi,
  / foram /gi,
  / fora /gi,
  / fôramos /gi,
  / seja /gi,
  / sejamos /gi,
  / sejam /gi,
  / fosse /gi,
  / fôssemos /gi,
  / fossem /gi,
  / for /gi,
  / formos /gi,
  / forem /gi,
  / serei /gi,
  / será /gi,
  / seremos /gi,
  / serão /gi,
  / seria /gi,
  / seríamos /gi,
  / seriam /gi,
  / tenho /gi,
  / tem /gi,
  / temos /gi,
  / tém /gi,
  / tinha /gi,
  / tínhamos /gi,
  / tinham /gi,
  / tive /gi,
  / teve /gi,
  / tivemos /gi,
  / tiveram /gi,
  / tivera /gi,
  / tivéramos /gi,
  / tenha /gi,
  / tenhamos /gi,
  / tenham /gi,
  / tivesse /gi,
  / tivéssemos /gi,
  / tivessem /gi,
  / tiver /gi,
  / tivermos /gi,
  / tiverem /gi,
  / terei /gi,
  / terá /gi,
  / teremos /gi,
  / terão /gi,
  / teria /gi,
  / teríamo /gi,
  / teriam /gi
];
