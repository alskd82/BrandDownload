
const $brandContainer = document.querySelector('.brand-grid'),
    $screenContainer = document.querySelector('.screen_container'),
    $screenWrapper = $screenContainer.querySelector('.screen_wrapper'),
    $screenDim = $screenContainer.querySelector('.screen_dim'),
    $btnDownload = $screenContainer.querySelector('.btn_download'),
    $lottieArea = $screenContainer.querySelector('.lottie-area'),

    $input = document.querySelector('#BrandName');

let state = "Basic"; // Basic | Boutique
let likePath = {}; 

let prevNum = -1
let touchNum = 0
let logoPlayNum = 2 // likePath.logo.length - 1;

let intervalId

(function(){
    inputSetting();
    commonLike() // 기본 좋아요 경로 셋팅
    console.log(likePath );

    const hash = window.location.hash.replace('#!', '');
    if(hash !== ''){
        console.log( `brand = ${hash}` )
        fetchPage( `/brand/${hash.toLowerCase()}` )
            .then((reault)=> {
                $input.value = hash.toLowerCase();
                document.querySelector('.bt-clear').classList.remove('is-hide');
                showScreen() 
            })
            .catch((error)=>{
                console.error('fetch에 문제가 있었습니다.', error);
                $input.value = ''
                document.querySelector('.bt-clear').classList.add('is-hide');
            })
    }

    $lottieArea.addEventListener('mousedown', e=> {
        console.log(e.type)
        gsap.killTweensOf( '.ic_like' );
        gsap.to( '.ic_like', .1, {scale: 1.25});
    })
    $lottieArea.addEventListener('click', e=> {
        console.log(e.type)
        createLike()
        gsap.to( '.ic_like', .1, {scale: 1});
    })

    $brandContainer.addEventListener('click', clickHandler);    // 상세 열기
    $screenDim.addEventListener('click', closeScreen );         // 상세 닫기

    document.body.classList.add('is-loaded');
})();

//========== hash #!에 브랜드명이 있을 때 ================================================
async function fetchPage(url){
    const res = await fetch(url);
    const contentType = res.headers.get('content-type');
    if( contentType?.includes('application/json')){
        const json = await res.join();
    } else {
        const html = await res.text();
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');

        // 부티크인지 아닌지 판단 //
        const isBasic = !doc.querySelector('.screen-basic').classList.contains('w-condition-invisible');
        state = isBasic ? "Basic": "Boutique" 
        // 로고 1~3 경로 //
        let logoArr = []
        for(let i=0; i < doc.querySelector('.screen_link-container').children.length; i++){
            logoArr.push( doc.querySelector('.screen_link-container').children[i].getAttribute('href') )
        }
        likePath[state]["logo"] = logoArr
        console.log( likePath )

        // 다운로드 링크 //
        const downloadLink = doc.querySelector('.btn_download').getAttribute('href')
        $btnDownload.href = downloadLink
        console.log( `downloadLink = ${downloadLink}` )
    }
}


//========== likePath 셋팅 ================================================
// let likePath = {
    // "basic" : {
    //     "heartColor_1" : ["color_1_01", "color_1_02"],                  // heart - #FF0000
    //     "heartColor_2" : ["color_2_01", "color_2_02"],                  // heart - #D71132
    //     "heartColor_3" : ["color_3_01", "color_3_02", "color_3_03"],    // heart - #F8A980
    //     "heartColor_4" : ["color_4_01", "color_4_02", "color_4_03"],    // heart - #FFC555
    //     "bubble_red"   : ["bubble_r_01", "bubble_r_02"],
    //     "bubble_white" : ["bubble_w_01", "bubble_w_02", "bubble_w_03"],
    //     "sticker"      : ["sticker_01", "sticker_02", "sticker_03"],    // % sticker
    //     "logo"         : ["logo_1", "logo_2", "logo_3"]
    // }
// }

function commonLike(){
    document.querySelectorAll('.section-common .btn-download-wrapper').forEach( (wrapper,i)=>{
        likePath[wrapper.querySelector('.btn').textContent] = {}
        fetchLike( wrapper.querySelector('a.is-hide').href , wrapper.querySelector('.btn').textContent )
    })

    function fetchLike(src , name){
        const response = fetch(src).then((response)=>{
            return response.text()
        }).then((html)=>{
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');

            const likeContainer = doc.querySelector('.screen_link-container')
            const linkNum = likeContainer.childElementCount
            likePath[name]["heartColor_1"] = [ likeContainer.querySelectorAll('a')[0].href, likeContainer.querySelectorAll('a')[1].href ]
            likePath[name]["heartColor_2"] = [ likeContainer.querySelectorAll('a')[2].href, likeContainer.querySelectorAll('a')[3].href ] 
            likePath[name]["heartColor_3"] = [ likeContainer.querySelectorAll('a')[4].href, likeContainer.querySelectorAll('a')[5].href, likeContainer.querySelectorAll('a')[6].href ] 
            likePath[name]["heartColor_4"] = [ likeContainer.querySelectorAll('a')[7].href, likeContainer.querySelectorAll('a')[8].href, likeContainer.querySelectorAll('a')[9].href ] 
            likePath[name]["bubble_red"] = [ likeContainer.querySelectorAll('a')[10].href, likeContainer.querySelectorAll('a')[11].href]
            likePath[name]["bubble_white"] = [ likeContainer.querySelectorAll('a')[12].href, likeContainer.querySelectorAll('a')[13].href, likeContainer.querySelectorAll('a')[14].href]
            likePath[name]["sticker"] = [ likeContainer.querySelectorAll('a')[15].href, likeContainer.querySelectorAll('a')[16].href, likeContainer.querySelectorAll('a')[17].href]
            
        })
    }

}

//========== create like  ================================================
function randowmSort(){
    var likePathGroup = ""
    var n = Math.floor( Math.random() * 7 );
    while( n == prevNum ){
        n = Math.floor( Math.random() * 7 );
    }
    prevNum = n
    if(n == 0)      likePathGroup = "heartColor_1"
    else if(n == 1) likePathGroup = "heartColor_2"
    else if(n == 2) likePathGroup = "heartColor_3"
    else if(n == 3) likePathGroup = "heartColor_4"
    else if(n == 4) likePathGroup = "bubble_red"
    else if(n == 5) likePathGroup = "bubble_white"
    else if(n == 6) likePathGroup = "sticker"
    var detailRandom = Math.floor( Math.random() * likePath[state][likePathGroup].length );

    return likePath[state][likePathGroup][detailRandom]
}

function createLike(){
    if( $lottieArea.childElementCount > 6) return
    
    const elem = document.createElement('div');
    elem.style.width = elem.style.height = "100%";
    elem.style.position = 'absolute'
    elem.style.left = elem.style.top = 0;

    let data = randowmSort()
    touchNum++;
    if( touchNum % 3 == 0){ // ===================== 로고가 나오는 타이밍 6번에 한번씩 // touchNum % 6 == 0
        logoPlayNum++
        data = likePath[state]["logo"][logoPlayNum % 3]
        // data =  `./json/${likePath.logo[logoPlayNum % likePath.logo.length]}.json`;
    }
    else{ 
        // data = `./json/${randowmSort()}.json`;
        data = randowmSort();
    }
    
    let lottieAnimation = lottie.loadAnimation({ 
        container: elem, renderer: "svg", autoplay: true, loop: false,  
        path: data 
        //animationData: data 
    }); 
    lottieAnimation.setSubframe = false;
    lottieAnimation.onComplete = function(){
        lottieAnimation.destroy();
        elem.parentNode.removeChild(elem);
    }
    $lottieArea.appendChild(elem)
};



//==========  상세 열고 닫기 ================================================

function clickHandler(e){
    prevNum = -1
    touchNum = 0; 
    logoPlayNum = 2

    let elem = e.target;    
    while( !elem.classList.contains('w-dyn-item') ){
        elem = elem.parentNode;
        if( elem.nodeName == 'BODY'){
            elem = null;
            return
        }
    }

    dataMatch(elem)
    showScreen()
    // fetchPage( url )
}

function dataMatch(elem){
    /* 상세가 부티크인지 아닌지 */
    state = (elem.querySelectorAll('.brand_info > span')[3].textContent === "true") ? "Boutique" : "Basic"
    /* 로고타입 경로 */
    let logoArr = [
        elem.querySelectorAll('.brand_info > span')[0].textContent,
        elem.querySelectorAll('.brand_info > span')[1].textContent,
        elem.querySelectorAll('.brand_info > span')[2].textContent
    ]
    likePath[state]["logo"] = logoArr
    console.log( likePath )

    /* 다운로드 링크 */
    $btnDownload.href = elem.querySelectorAll('.brand_info > span')[4].textContent
}

function showScreen(){
    if(!likePath[state]["logo"]){
        console.log( likePath[state]["logo"] )
        likePath[state]["logo"] = [
            document.querySelectorAll('.brand .brand_info > span')[0].textContent,
            document.querySelectorAll('.brand .brand_info > span')[1].textContent,
            document.querySelectorAll('.brand .brand_info > span')[2].textContent
        ];
        $btnDownload.href = document.querySelectorAll('.brand .brand_info > span')[4].textContent
    }

    $screenContainer.classList.remove('is-hide') 
    const tl = gsap.timeline()
    tl.set($screenWrapper, {autoAlpha:0, y: 50})
        .set($screenDim, {autoAlpha:0})
        .to($screenDim, .2, {autoAlpha: 1, ease: 'Quart.easeOut'})
        .to($screenWrapper, .4, {y:0, autoAlpha: 1, ease: 'Quart.easeOut'}, 0);
    
    intervalId && (clearInterval( intervalId ))
    const event = document.createEvent("HTMLEvents");
    event.initEvent("mousedown", false, false)
    intervalId = setInterval(()=>{
        // $lottieArea.dispatchEvent(event)
        $lottieArea.click()
    }, 400)
}

function closeScreen(e){
    clearInterval( intervalId )
    gsap.to([$screenWrapper,$screenDim], 0.2, {autoAlpha: 0, ease: 'Quart.easeOut', onComplete: ()=>{
        $screenContainer.classList.add('is-hide')
    }})
}


//==========  검색창 셋팅 ================================================
function inputSetting(){
    document.querySelector('.bt-clear').classList.add('is-hide')
    $input.oninput = function() {
        if($input.value.length > 0){
            if(document.querySelector('.bt-clear').classList.contains('is-hide')){
                document.querySelector('.bt-clear').classList.remove('is-hide')
            }
        } else {
            document.querySelector('.bt-clear').classList.add('is-hide')
        }
    };

    $input.onblur = function() {
        $input.style.border = '';
    };
    $input.onfocus = function() {
        // input.style.border = '4px solid #0078ff';
    };
};

//========== 해시뱅 바뀔 때 마다 ================================================
window.addEventListener('hashchange', e=>{
    const hash = window.location.hash.replace('#!', '');
    console.log( `brand = ${hash}` )
    fetchPage( `/brand/${hash.toLowerCase()}` )
        .then((reault)=> {
            $input.value = hash.toLowerCase();
            document.querySelector('.bt-clear').classList.remove('is-hide');
            showScreen() 
        })
        .catch((error)=>{
            console.error('fetch에 문제가 있었습니다.', error);
            $input.value = ''
            document.querySelector('.bt-clear').classList.add('is-hide');
        });
});