
<!-- NAVBAR VERSIÓN 2 -->
<div class="container-fluid noPadding ignoreThis">
  <nav class="row navBar border-bottom align-items-center" data-bs-theme="dark">
    <!-- Logo -->
    <div class="col-1 col-sm-2 col-md-1">
      <a href="index.html" class="navLogo"></a>
    </div>

    <div class="col-8 col-sm-7 col-md-8">
      <form method="get" id="searchForm" action="<?= asset('results.php') ?>" class="d-flex justify-content-center align-items-center">
        <button type="submit" id="searchIcon" class="normalButton"><i class="bi bi-search"></i></button>
        <input id="searchThis" name="searchThis" type="search" class="navSearch border" placeholder="Busca algo...">
        <button type="button" id="advSearchIcon" class="normalButton"><i class="bi bi-list-stars"></i></button>
      </form>
    </div>

    <!-- Espacio vacío -->
    <div class="d-none d-md-block col-md-1"></div>

    <!-- Íconos de usuario -->
    <div id="itemsContainer" class="col-3 col-sm-3 col-md-2 d-flex align-items-center justify-content-center">
  <a href="<?= asset('profile.php') ?>"><img id="photoUser" class="navPhoto img-fluid" src="<?= asset('media/userPhoto.png') ?>" alt="Foto de usuario"></a>
  <a href="<?= asset('newPost.php') ?>"><i class="bi bi-plus-square navIcon "></i></a>
  <a href="<?= asset('logIn.php') ?>"><i class="bi bi-box-arrow-right navIcon"></i></a>
    </div>
  </nav>
</div>
