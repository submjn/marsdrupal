<?php

namespace Drupal\home_search_block\Plugin\Block;

use Drupal\Core\Block\BlockBase;

/**
 * Provides a 'Home Search Block' block.
 *
 * @Block(
 *  id = "homesearchblock",
 *  admin_label = @Translation("Home Search Block"),
 * )
 */
class HomeSearchBlock extends BlockBase {

  /**
   * {@inheritdoc}
   */

  public function build() {
    $build = [];
    $build['#attached']['library'][] = 'home_search_block/home_search_block.css';
    $build['#attached']['library'][] = 'home_search_block/home_search_block.js';
    $build['#theme'] = 'home_search_block_view';
    return $build;
  }

}
