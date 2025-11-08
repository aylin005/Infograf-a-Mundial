<div class="overlay">
    <div id="likesModal" class="modalContainer p-0 noScrollY">
        <div class="d-flex justify-content-end p-3">
            <button id="closeModal" type="button" class="addButton noBackground noBorder"><i class="bi bi-x-square deleteIcon"></i></button>
        </div>

        <ul class="nav nav-tabs" data-bs-theme="dark">
            <li class="nav-item">
                <a class="nav-link active py-0" data-bs-toggle="tab" aria-current="page" href="#upvotesContainer" role="tab">
                    <div class="d-flex showCalif p-0">
                        <button id="upVoteButton" class="noBackground noBorder transparentButton"><i class="bi bi-arrow-up-square my-1 goodVoteIcon"></i></button> 
                        <p id="upVote" class="syncopate-regular m-2 rem0d5Text">4M</p>
                    </div>
                </a>
            </li>
            <li class="nav-item">
                <a class="nav-link py-0" data-bs-toggle="tab" href="#downVotesContainer" role="tab">
                    <div class="d-flex showCalif p-0">
                        <button id="downVoteButton" class="noBackground noBorder transparentButton"><i class="bi bi-arrow-down-square my-1 badVoteIcon"></i></button>
                        <p id="downVote" class="syncopate-regular m-2 rem0d5Text">66</p>
                    </div>
                </a>
            </li>
        </ul>

        <div class="tab-content">
            <div class="tab-pane fade show active" id="upvotesContainer" role="tabpanel">
                <!-- NOTA: Plantilla de preview perfil -->
                <div class="scrollY p-2">
                    <a href="/profile">
                        <div id="showUser" class="d-flex align-items-center p-3">
                            <img id="photoUser" class="navPhoto img-fluid m-0" src="<?= asset('media/userPhoto.png') ?>" alt="Foto de usuario">
                            <p class="my-0 mx-2 ">Username</p>
                        </div>
                    </a>
                </div>
            </div>
            <div class="tab-pane fade" id="downvotesContainer" role="tabpanel">
            </div>
        </div>
    </div>
</div>