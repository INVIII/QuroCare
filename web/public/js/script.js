$(document).ready(function () {
  var w = window.innerWidth;

  if (w > 767) {
    $("#menu-jk").scrollToFixed();
  } else {
    $("#menu-jk").scrollToFixed();
  }
});
const darks = document.querySelectorAll(
  ".header,.carousel-cover,.key-features,.about-us,.gallery,.contact-us-single,.footer"
);
let darkMode = localStorage.getItem("darkMode");
const chk = document.getElementById("chk");

const enableDarkMode = () => {
  darks.forEach((e) => {
    e.classList.add("dark");
  });

  localStorage.setItem("darkMode", "enabled");
};
const disableDarkMode = () => {
  darks.forEach((e) => {
    e.classList.remove("dark");
  });
  localStorage.setItem("darkMode", null);
};

if (darkMode === "enabled") {
  enableDarkMode();
}
chk.addEventListener("change", () => {
  darkMode = localStorage.getItem("darkMode");
  if (darkMode !== "enabled") {
    enableDarkMode();
    // if it has been enabled, turn it off
  } else {
    disableDarkMode();
  }
});

$(document).ready(function () {
  $(".filter-button").click(function () {
    var value = $(this).attr("data-filter");

    if (value == "all") {
      //$('.filter').removeClass('hidden');
      $(".filter").show("1000");
    } else {
      //            $('.filter[filter-item="'+value+'"]').removeClass('hidden');
      //            $(".filter").not('.filter[filter-item="'+value+'"]').addClass('hidden');
      $(".filter")
        .not("." + value)
        .hide("3000");
      $(".filter")
        .filter("." + value)
        .show("3000");
    }
  });

  if ($(".filter-button").removeClass("active")) {
    $(this).removeClass("active");
  }
  $(this).addClass("active");
});
