import React from 'react';

export function Icon({ name, size = 20, ...props }) {
  const paths = {
    settings: <><path d="m9.5 3-.6 2.2-2 .9-2-.6-2.4 4 1.7 1.6v2l-1.7 1.6 2.4 4 2-.6 2 .9.6 2.2h5l.6-2.2 2-.9 2 .6 2.4-4-1.7-1.6v-2l1.7-1.6-2.4-4-2 .6-2-.9L14.5 3z"/><circle cx="12" cy="12" r="3"/></>,
    hint: <><path d="M8 16c0-2-3-3.2-3-7a7 7 0 0 1 14 0c0 3.8-3 5-3 7M8 17h8M9 20h6M10 23h4"/><path d="m9 8 2 2 4-4"/></>,
    restart: <><path d="M4 10a8 8 0 1 1 1 7M4 4v6h6"/></>,
    help: <><circle cx="12" cy="12" r="9"/><path d="M9.3 9a2.8 2.8 0 1 1 4.5 2.2c-1.4.8-1.8 1.2-1.8 2.8"/><path d="M12 17h.01"/></>,
    close: <path d="m6 6 12 12M18 6 6 18"/>,
    arrow: <path d="M4 12h15m-6-6 6 6-6 6"/>,
    heart: <path d="M20.8 5.6a5.3 5.3 0 0 0-7.5 0L12 7l-1.3-1.4a5.3 5.3 0 0 0-7.5 7.5L12 22l8.8-8.9a5.3 5.3 0 0 0 0-7.5Z"/>,
    check: <path d="m5 12 4 4L19 6"/>,
    download: <><path d="M12 3v12m-5-5 5 5 5-5M4 16v5h16v-5"/></>,
    trophy: <><path d="M7 3h10v5a5 5 0 0 1-10 0zm0 2H3v3a4 4 0 0 0 5 4m9-7h4v3a4 4 0 0 1-5 4M12 13v7m-4 1h8"/></>,
    star: <path d="m12 2 3 6 7 1-5 5 1 7-6-3-6 3 1-7-5-5 7-1z"/>,
    sound: <><path d="m11 4-6 5H2v6h3l6 5zM16 8a6 6 0 0 1 0 8m3-11a10 10 0 0 1 0 14"/></>,
  };
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>{paths[name] || paths.star}</svg>;
}

const shapeNames = {
  garden: ['cherry', 'pear', 'lemon', 'blueberry', 'orange', 'grape'],
  denmark: ['strawberry', 'apple', 'flower', 'dk', 'cookie', 'blueberry'],
  thailand: ['mangosteen', 'coconut', 'mango', 'lotus', 'pineapple', 'th'],
};

// Original vector artwork; shared palettes keep the six game pieces easy to tell apart.
export function Fruit({ kind = 0, theme = 'garden', className = '' }) {
  const shape = shapeNames[theme][kind];
  const leaf = <path d="M31 14c2-9 10-10 14-8-1 7-6 10-14 8Z" fill="#548757"/>;
  let art;
  switch (shape) {
    case 'cherry': art = <><path d="M21 35c3-10 13-15 13-25 0 9 8 15 9 22" fill="none" stroke="#518556" strokeWidth="3.5" strokeLinecap="round"/>{leaf}<circle cx="20" cy="40" r="12" fill="#df5966"/><circle cx="43" cy="40" r="12" fill="#c83f58"/><path d="M14 35c1-2 3-3 5-3m18 3c1-2 3-3 5-3" stroke="#ffb7af" strokeWidth="3" strokeLinecap="round"/></>; break;
    case 'pear': art = <><path d="M33 17c-12-1-9 12-17 20-11 12-2 24 15 23 17 1 25-12 15-24-8-8-2-18-13-19Z" fill="#8ba84e"/><path d="M31 18c-1-7 1-11 6-13" fill="none" stroke="#706947" strokeWidth="3.5" strokeLinecap="round"/>{leaf}<path d="M23 36c-4 5-5 9-3 12" fill="none" stroke="#d2df9b" strokeWidth="4" strokeLinecap="round"/><circle cx="39" cy="48" r="1.4" fill="#617f37"/></>; break;
    case 'lemon': art = <><path d="M8 42c-5-6 1-8 2-13 2-11 20-20 33-15 6 2 9 7 12 9 6 4 3 8-1 11-4 15-28 23-39 13-2-2-4-2-7-5Z" fill="#edbe42"/><path d="M18 29c5-6 13-9 21-8" stroke="#fff0a6" strokeWidth="4" fill="none" strokeLinecap="round"/><path d="M41 11c1-7 8-8 13-7-1 6-6 10-13 7Z" fill="#62915c"/></>; break;
    case 'blueberry': art = <><path d="M29 14c0-7 9-10 17-7-2 7-9 10-17 7Z" fill="#599166"/><circle cx="24" cy="30" r="14" fill="#7898ba"/><circle cx="43" cy="37" r="14" fill="#56759c"/><circle cx="25" cy="46" r="14" fill="#5f7fa9"/><path d="m24 19 2 4 4 1-4 2-2 4-2-4-4-2 4-1zm19 7 2 4 4 1-4 2-2 4-2-4-4-2 4-1zM25 36l2 4 4 1-4 2-2 4-2-4-4-2 4-1z" fill="#354d78"/><path d="m15 29 2-3m19 11 2-3m-23 19 1-3" stroke="#b6c9df" strokeWidth="3" strokeLinecap="round"/></>; break;
    case 'orange': art = <><circle cx="31" cy="36" r="23" fill="#e9993f"/><path d="M19 23c3-3 6-4 10-4" stroke="#ffcf7b" strokeWidth="4" strokeLinecap="round"/><path d="M31 13c1-8 8-11 16-8-1 7-7 11-16 8Z" fill="#5e9566"/><path d="M31 15V8" stroke="#65835b" strokeWidth="3" strokeLinecap="round"/><g fill="#d7822c"><circle cx="43" cy="39" r="1.2"/><circle cx="39" cy="45" r="1.2"/><circle cx="45" cy="46" r="1.2"/><circle cx="34" cy="50" r="1.2"/></g></>; break;
    case 'grape': art = <><path d="M32 15c0-7 4-10 7-12" stroke="#65835b" strokeWidth="3" fill="none" strokeLinecap="round"/><path d="M33 14C22 4 14 9 13 16c7 5 15 6 20-2Z" fill="#6b9a63"/><g fill="#9370a1"><circle cx="23" cy="26" r="10"/><circle cx="42" cy="26" r="10"/><circle cx="22" cy="42" r="10"/><circle cx="42" cy="42" r="10"/><circle cx="32" cy="51" r="10"/></g><circle cx="32" cy="34" r="10" fill="#a67fb2"/><path d="m19 22 2-2m17 2 2-2m-10 10 2-1m-15 29 1-2m17 3 1-2m-11 12 2-2" stroke="#d6b8dd" strokeWidth="2.5" strokeLinecap="round"/></>; break;
    case 'strawberry': art = <><path d="M10 27c-1-13 42-13 44 0 2 12-15 33-22 33S9 39 10 27Z" fill="#db6470"/><path d="m32 24-17-9 12-1 5-10 5 10 13 1-18 9Z" fill="#599261"/><path d="m20 29 1 3m12-3v3m11-3-1 3m-17 7 1 3m11-3-1 3m-4 6v3" stroke="#ffe5b0" strokeWidth="2.5" strokeLinecap="round"/></>; break;
    case 'apple': art = <><path d="M32 19C9 7 4 31 14 48c7 12 12 8 18 8s12 4 18-9C61 26 51 8 32 19Z" fill="#83a85c"/>{leaf}<path d="M31 20c0-8-2-11-4-14" stroke="#77654c" strokeWidth="3.5" fill="none" strokeLinecap="round"/><path d="M19 27c-4 3-5 8-3 12" stroke="#ccdfa3" strokeWidth="4" fill="none" strokeLinecap="round"/></>; break;
    case 'flower': art = <><path d="M32 36v25m0-8c-9 0-15-5-14-11 10-2 15 3 14 11" fill="#719559" stroke="#719559" strokeWidth="3"/>{[0,72,144,216,288].map((angle) => <ellipse key={angle} cx="32" cy="18" rx="8" ry="13" fill="#f0c95f" transform={`rotate(${angle} 32 29)`}/>)}<circle cx="32" cy="29" r="8" fill="#b88436"/></>; break;
    case 'dk': art = <><path d="M12 9v49" stroke="#7194ad" strokeWidth="3.5" strokeLinecap="round"/><path d="M14 11h42v29H14Z" fill="#cf5f67"/><path d="M27 11v29m-13-15h42" stroke="#fff5e9" strokeWidth="5"/><circle cx="12" cy="7" r="3" fill="#dab36d"/></>; break;
    case 'cookie': art = <><path d="m32 9 7 3 8 1 3 8 5 7-2 8 1 8-7 5-5 6-8-1-8 2-6-6-7-4v-8l-3-8 5-7 3-8 8-1Z" fill="#dca551"/><circle cx="32" cy="32" r="16" fill="none" stroke="#f7d48c" strokeWidth="3"/>{[[25,25],[39,27],[32,38],[20,37],[42,40]].map(([cx,cy])=><circle key={cx} cx={cx} cy={cy} r="2.2" fill="#98703c"/>)}</>; break;
    case 'mangosteen': art = <><circle cx="31" cy="38" r="23" fill="#98567f"/><path d="M31 20c-12-2-15-8-15-13 8-1 13 2 15 8 1-7 8-10 15-8 0 6-6 12-15 13Z" fill="#65985b"/><path d="m30 17 2-12" stroke="#537b49" strokeWidth="3"/><path d="M16 32c1-4 3-6 6-7" stroke="#cb8eaf" strokeWidth="4" fill="none" strokeLinecap="round"/></>; break;
    case 'coconut': art = <><circle cx="32" cy="35" r="24" fill="#7b9e5e"/><ellipse cx="32" cy="33" rx="18" ry="19" fill="#faf1d4"/><ellipse cx="32" cy="33" rx="12" ry="13" fill="#c9dfb2"/><path d="m34 27 6-21h10" stroke="#72a59a" strokeWidth="4" fill="none" strokeLinecap="round"/><path d="M15 49c5 4 10 6 15 6" stroke="#a7bf83" strokeWidth="3" fill="none" strokeLinecap="round"/></>; break;
    case 'mango': art = <><path d="M39 13C13 7 7 24 9 38c3 19 27 28 37 14 9-13 9-31-7-39Z" fill="#eab947"/>{leaf}<path d="M22 22c-6 3-8 9-7 15" stroke="#ffe49a" strokeWidth="4" fill="none" strokeLinecap="round"/></>; break;
    case 'lotus': art = <><path d="M32 53C8 57 4 47 3 37c13-1 23 4 29 16 8-13 17-17 29-16-2 14-13 21-29 16Z" fill="#659b89"/><path d="M32 50C11 48 8 33 11 19c12 3 18 15 21 31 3-16 9-28 21-31 3 14 0 29-21 31Z" fill="#a0b5d7"/><path d="M32 51C16 39 21 19 32 7c11 12 16 32 0 44Z" fill="#7a91ba"/><path d="M32 42V21" stroke="#c5d2e7" strokeWidth="3" strokeLinecap="round"/></>; break;
    case 'pineapple': art = <><path d="m31 23-13-9 8 1-2-13 9 10 9-9-1 13 9-3-12 12Z" fill="#6e985e"/><rect x="15" y="21" width="35" height="39" rx="16" fill="#dc9f46"/><path d="m19 28 27 22m-30-12 21 19m-3-35 14 12m-29 15 27-22m-18 30 21-19m-32-4 14-12" stroke="#f0c777" strokeWidth="2"/></>; break;
    case 'th': art = <><path d="M12 9v49" stroke="#9d8cb8" strokeWidth="3.5" strokeLinecap="round"/><path d="M14 11h42v30H14Z" fill="#bf687d"/><path d="M14 16h42v20H14Z" fill="#fff4e8"/><path d="M14 21h42v10H14Z" fill="#736a9e"/><circle cx="12" cy="7" r="3" fill="#dab36d"/></>; break;
  }
  return <svg className={`fruit-art ${className}`} viewBox="0 0 64 64" aria-hidden="true">{art}</svg>;
}

export function BrandMark() {
  return <svg className="brand-mark" viewBox="0 0 48 48" aria-hidden="true"><rect x="5" y="5" width="17" height="17" rx="5" fill="#ed774d" transform="rotate(-9 13 13)"/><rect x="27" y="8" width="17" height="17" rx="5" fill="#99ac79" transform="rotate(10 35 16)"/><rect x="16" y="28" width="17" height="17" rx="5" fill="#e9ba5c" transform="rotate(-5 24 36)"/><path d="m13 9 1 3 4 1-3 2 1 4-3-2-3 2 1-4-3-2 4-1Zm22 4 1 3 4 1-3 2 1 4-3-2-3 2 1-4-3-2 4-1Zm-11 19 1 3 4 1-3 2 1 4-3-2-3 2 1-4-3-2 4-1Z" fill="#fff9e9"/></svg>;
}
