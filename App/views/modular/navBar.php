
<!-- NAVBAR VERSIÓN 2 -->
<div class="container-fluid noPadding ignoreThis">
  <nav class="row navBar border-bottom align-items-center" data-bs-theme="dark">
    <!-- Logo -->
    <div class="col-1 col-sm-2 col-md-1">
  <a href="/" class="navLogo"></a>
    </div>

    <div class="col-8 col-sm-7 col-md-8">
  <form method="get" id="searchForm" action="/results" class="d-flex justify-content-center align-items-center">
        <input id="searchThis" name="searchThis" type="search" class="navSearch border" placeholder="Busca algo...">
        <button type="submit" id="searchIcon" class="normalButton"><i class="bi bi-search"></i></button>
        <button type="button" id="advSearchIcon" class="normalButton"><i class="bi bi-list-stars"></i></button>
      </form>
    </div>

    <!-- Espacio vacío -->
    <div class="d-none d-md-block col-md-1"></div>

    <!-- Íconos de usuario -->
    <div id="itemsContainer" class="col-3 col-sm-3 col-md-2 d-flex align-items-center justify-content-center">
      <a href="/profile"><img id="photoUser" class="navPhoto img-fluid" src="<?= asset('media/userPhoto.png') ?>" alt="Foto de usuario"></a>
      <a href="/newPost"><i class="bi bi-plus-square navIcon "></i></a>
      <a href="/login"><i class="bi bi-box-arrow-in-right navIcon"></i></a>
      <!-- <a href="/adminPosts"><i class="bi bi-person-circle navIcon"></i></a> -->
    <!-- NOTA: Para signOut-->
      <!-- <a href="/login"><i class="bi bi-box-arrow-right navIcon"></i></a> -->
    </div>
  </nav>
</div>
