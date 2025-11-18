(function(){
  try{
    const MAPPING_URL='https://script.google.com/macros/s/AKfycbyrDIOuFB4YSelDDYjU7HWLKfWCnFaHR8_a-8fNl4KlJ13t5_tCLWe-aNeNRSpngn5F0g/exec';
    const h=window.location.hostname;
    let s='',n='',p='',j='';
    
    if(h.match(/biccamera.rakuten.co.jp/)){
      s="楽天Bic";
      const titleElem=document.getElementsByClassName("p-productDetailv2__title")[0];
      n=titleElem?titleElem.innerHTML:'';
      const priceElem=document.getElementsByClassName("p-productDetailv2__priceValue")[0];
      p=priceElem?priceElem.innerHTML.replace(/<[^>]*>/g,"").replace(/[^0-9]/g,""):'';
    }else if(h.match(/store.shopping.yahoo.co.jp/)){
      const storeElem=document.querySelector('.styles_storeName__ceQTF');
      s=storeElem?storeElem.textContent:'';
      const nameElem=document.querySelector('.styles_name__u228e');
      n=nameElem?nameElem.textContent:'';
      const priceElem=document.querySelector('meta[itemprop="price"]');
      p=priceElem?priceElem.getAttribute('content'):'';
      const sc=document.querySelector('script[id="item-json-ld"]');
      if(sc){
        try{
          const jsd=JSON.parse(sc.textContent);
          j=jsd.gtin13||"";
        }catch(e){}
      }
      if(!j){
        const nextData=document.querySelector('script[id="__NEXT_DATA__"]');
        if(nextData){
          try{
            const jsonData=JSON.parse(nextData.textContent);
            j=jsonData.props.pageProps.item.janCode||"";
          }catch(e){}
        }
      }
      if(j){j=j.padStart(13,'0');}
    }else if(h.match(/item.rakuten.co.jp/)){
      let e=document.title;
      let lastColonIndex=e.lastIndexOf("：");
      if(lastColonIndex>0){
        s=e.slice(lastColonIndex+1).trim();
        n=e.substring(0,lastColonIndex);
        if(n.startsWith("【楽天市場】")){n=n.slice(7);}
      }else{
        n=e;
      }
      let text=document.getElementsByTagName("body")[0].innerHTML;
      const found=text.match(/data-price="([0-9]+)"/);
      if(found){p=found[1];}
      const janMeta=document.querySelector('meta[itemprop=gtin13]');
      console.log('gtin13は',janMeta.content);
      if(!janMeta){
        const janMeta=document.querySelector('meta[itemprop=gtin12]');
        console.log('gtin13がない');
        console.log('gtin12は',janMeta.content);
      }
      if(janMeta&&janMeta.content){
        j=janMeta.content.padStart(13,'0');
      }
    }
    
    let u=window.location.href;
    n='=HYPERLINK("'+u+'","'+n+'")';
    let dt=new Date();
    let y=dt.getFullYear();
    let m=("00"+(dt.getMonth()+1)).slice(-2);
    let d=("00"+dt.getDate()).slice(-2);
    let ymd=y+"/"+m+"/"+d;
    
    function getAsin(janCode,callback){
      console.log('getAsin:',janCode);
      if(!janCode||janCode==='0'){
        callback("");
        return;
      }
      
      const cacheKey='janAsinMapping';
      const cacheTimeKey='janAsinMappingTime';
      const cacheTime=localStorage.getItem(cacheTimeKey);
      const now=new Date().getTime();
      const oneDay=24*60*60*1000;
      
      if(cacheTime&&(now-parseInt(cacheTime))<oneDay){
        try{
          const mapping=JSON.parse(localStorage.getItem(cacheKey));
          const asin=mapping[janCode]||"";
          console.log('Cache hit:',janCode,asin);
          callback(asin);
          return;
        }catch(e){
          console.error('Cache error:',e);
        }
      }
      
      const callbackName='jsonpCallback_'+Date.now();
      console.log('JSONP request:',callbackName);
      
      window[callbackName]=function(data){
        console.log('Response:',Object.keys(data).length,'entries');
        try{
          delete window[callbackName];
          localStorage.setItem(cacheKey,JSON.stringify(data));
          localStorage.setItem(cacheTimeKey,now.toString());
          const asin=data[janCode]||"";
          console.log('ASIN:',janCode,asin);
          callback(asin);
        }catch(e){
          console.error('Callback error:',e);
          callback("");
        }
      };
      
      const script=document.createElement('script');
      script.src=MAPPING_URL+'?callback='+callbackName+'&t='+Date.now();
      console.log('Loading:',script.src);
      
      script.onerror=function(){
        console.error('Load error');
        delete window[callbackName];
        callback("");
      };
      
      setTimeout(()=>{
        if(window[callbackName]){
          console.error('Timeout');
          delete window[callbackName];
          callback("");
        }
      },10000);
      
      document.head.appendChild(script);
    }
    
    getAsin(j,function(asin){
      console.log('Final ASIN:',asin);
      const info=ymd+"\t"+s+"\t"+n+"\t"+p+"\t0\t1\t0\t0\t0%\t10%"+"\t"+j+"\t"+asin;
      
      navigator.clipboard.writeText(info).then(()=>{
        const notification=document.createElement('div');
        notification.textContent='コピー完了'+(asin?' (ASIN: '+asin+')':(j?' (JAN: '+j+')':''));
        notification.style.cssText='position:fixed;top:20px;left:50%;transform:translateX(-50%);background:#4CAF50;color:white;padding:15px 30px;border-radius:5px;box-shadow:0 2px 5px rgba(0,0,0,0.3);z-index:10000;font-size:14px;';
        document.body.appendChild(notification);
        setTimeout(()=>notification.remove(),3000);
      }).catch(err=>console.error('Copy failed:',err));
    });
  }catch(err){
    console.error('Error:',err);
    alert('エラー: '+err.message);
  }
})();
