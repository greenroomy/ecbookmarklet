(function(){
  try{
    const h=window.location.hostname;
    let siteName='';
    if(h.match(/rakuten.co.jp/)){
      siteName='楽天市場';
    }else if(h.match(/shopping.yahoo.co.jp/)){
      siteName='Yahoo!ショッピング';
    }else{
      siteName='このサイト';
    }
    
    const before1=localStorage.getItem('janAsinMapping');
    const before2=localStorage.getItem('janAsinMappingTime');
    
    localStorage.removeItem('janAsinMapping');
    localStorage.removeItem('janAsinMappingTime');
    
    const after1=localStorage.getItem('janAsinMapping');
    const after2=localStorage.getItem('janAsinMappingTime');
    
    const notification=document.createElement('div');
    notification.textContent=siteName+'のキャッシュクリア完了！\n削除前: '+(before1?'あり':'なし')+' → 削除後: '+(after1?'あり':'なし');
    notification.style.cssText='position:fixed;top:20px;left:50%;transform:translateX(-50%);background:#f44336;color:white;padding:15px 30px;border-radius:5px;box-shadow:0 2px 5px rgba(0,0,0,0.3);z-index:10000;font-size:14px;white-space:pre-line;';
    document.body.appendChild(notification);
    setTimeout(()=>notification.remove(),5000);
    
    console.log(siteName+'キャッシュクリア',{
      削除前mapping:before1?'あり':'なし',
      削除前time:before2,
      削除後mapping:after1,
      削除後time:after2
    });
  }catch(e){
    alert('エラー: '+e.message);
  }
})();
