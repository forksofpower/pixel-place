Rails.application.routes.draw do

  resources :paints
  resources :pixels
  resources :users
  root "place#index"
end
