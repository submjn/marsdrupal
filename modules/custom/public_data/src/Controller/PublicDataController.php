<?php
namespace Drupal\public_data\Controller;

use Drupal\Core\Controller\ControllerBase;

class PublicDataController extends ControllerBase {

  public function viewPublicData() {
    //$title = t('Hello!');
    $build['myelement'] = array(
      '#theme' => 'public_data_view',
      //'#title' => $title,
    );

    //$build['myelement']['#attached']['library'][] = 'public_data/angularjs';
    $build['myelement']['#attached']['library'][] = 'public_data/public_data_js';
    $build['myelement']['#attached']['library'][] = 'public_data/public_data_css';
    return $build;
  }
}
