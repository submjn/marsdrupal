<?php
namespace Drupal\interactive_map\Controller;

use Drupal\Core\Controller\ControllerBase;

class InteractiveMapController extends ControllerBase {

  public function viewInteractiveMap() {
    //$title = t('Hello!');
    $build['myelement'] = array(
      '#theme' => 'interactive_map_view',
      //'#title' => $title,
    );

    //$build['myelement']['#attached']['library'][] = 'interactive_map/angularjs';
    $build['myelement']['#attached']['library'][] = 'interactive_map/interactive_map_js';
    $build['myelement']['#attached']['library'][] = 'interactive_map/interactive_map_css';
    return $build;
  }
}
