<?php
namespace Drupal\api\Controller;

use Drupal\Core\Controller\ControllerBase;

class ApiController extends ControllerBase {

  public function viewApi() {
    //$title = t('Hello!');
    $build['myelement'] = array(
      '#theme' => 'api_view',
      //'#title' => $title,
    );

    //$build['myelement']['#attached']['library'][] = 'api/angularjs';
    $build['myelement']['#attached']['library'][] = 'api/api_js';
    $build['myelement']['#attached']['library'][] = 'api/api_css';
    return $build;
  }
}
