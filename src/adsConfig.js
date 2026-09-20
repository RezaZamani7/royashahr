// پیکربندی تبلیغات
//
// لیست همه‌ی تبلیغ‌ها. هنگام نمایش، هر بار به‌صورت تصادفی یکی از موارد این لیست
// انتخاب و در هر جایی که <AdBanner> استفاده شده است نمایش داده می‌شود
// (مستقل از اینکه کدام بازی انتخاب شده باشد).
//
// فیلدهای هر تبلیغ:
//   image  : آدرس تصویر (فایل‌ها را داخل public/ads قرار دهید و مسیر را با "/ads/..." بنویسید)
//   link   : لینک مقصد هنگام کلیک روی تبلیغ
//   title  : متن جایگزین / عنوان تبلیغ (اختیاری، برای دسترس‌پذیری)
//
// افزودن تبلیغ جدید:  یک آیتم به این لیست اضافه کنید.
// حذف تبلیغ:          آیتم مورد نظر را از این لیست حذف کنید.

const adsConfig = [
  {
    image: "/ads/ad-coffee.svg",
    link: "https://example.com/ad-coffee",
    title: "کافه رویاشهر",
  },
  {
    image: "/ads/ad-pizza.svg",
    link: "https://example.com/ad-pizza",
    title: "پیتزا برتر",
  },
  {
    image: "/ads/ad-gym.svg",
    link: "https://example.com/ad-gym",
    title: "باشگاه تن‌اس‌اندام",
  },
  {
    image: "/ads/ad-shopping.svg",
    link: "https://example.com/ad-shop",
    title: "فروشگاه آنلاین",
  },
];

export default adsConfig;
